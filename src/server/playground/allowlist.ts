import "server-only";

import { openapiApi } from "@/content/openapi";
import { proxyApi } from "@/content/proxy";
import type { ApiDefinition } from "@/content/types";

/**
 * The only destinations the Live proxy may ever reach, each with its own
 * output and input policy. Adding an entry here is a security decision, not a
 * content change — see docs/SECURITY.md and docs/DECISIONS.md.
 *
 * - info-extensions: U-08 (2026-09-25).
 * - info-agents, cdr-get: Phase 5 adjustment (2026-09-25, A-42/A-43).
 * - openapi/simplecdrs-list: Phase 9 pilot (2026-10-08, SEC-REQ-08).
 */
interface LivePolicy {
  /**
   * JSON output fields the Live proxy may return per item. Everything else is
   * dropped server-side before redaction runs as a second layer. An empty list
   * drops every field of any JSON record the endpoint returns.
   */
  jsonFields: readonly string[];
  /** Anchored patterns a parameter value must match, on top of validate.ts's generic limits. */
  paramPatterns?: Readonly<Record<string, RegExp>>;
  /** Query values the portal always sends; the caller can neither see nor override them. */
  forcedQuery?: Readonly<Record<string, string>>;
  /** Documented parameters the caller may not set in Live (e.g. output formats we can't filter). */
  excludedParams?: readonly string[];
  /** Per-record field naming the tenant; an answer spanning more than one tenant is blocked. */
  tenantField?: string;
  /** Maximum `end - start` span, with the documented defaults for an omitted bound. */
  dateRange?: { start: string; end: string; maxDays: number };
  /** Upstream errors are `{"error":{...}}`; only `code` and `message` are passed on. */
  errorEnvelope?: boolean;
}

// Comma-separated list of `item`, whole value only.
const list = (item: string, flags = "") => new RegExp(`^${item}(,${item})*$`, flags);
const DIGITS = "\\+?[0-9*#]{1,32}";
const NAME = "[\\p{L}\\p{N} ._'-]{1,64}";

const LIVE_POLICIES = {
  // format=json is a 148-field config record incl. credentials, 2FA params,
  // PINs and PII (A-40). Mirrors the plain-format columns minus Password.
  // Must match the documented response schema (unit-tested).
  "proxy/info-extensions": {
    jsonFields: ["ex_id", "ex_number", "ex_name", "ex_tech", "st_state", "username"],
  },
  // Positional records, keys "0".."11" with 3 and 9 absent (A-43). All
  // observed positions approved by the user; meanings are not documented.
  // Name-based redaction cannot match numeric keys, so this list is the
  // effective control.
  "proxy/info-agents": {
    jsonFields: ["0", "1", "2", "4", "5", "6", "7", "8", "10", "11"],
    paramPatterns: { queue: /^\d+$/ },
  },
  // Returns the raw userfield text, whatever `format` is (A-42); `format` is
  // not offered. A JSON-looking userfield is cut to nothing, never passed on.
  "proxy/cdr-get": {
    jsonFields: [],
    paramPatterns: { uniqueid: /^([A-Za-z0-9_]+-)?\d+\.\d+$/ },
  },
  // Phase 9 pilot. Caller PII is shown to the key holder, never logged
  // (SEC-REQ-08). JSON only: template/xml output can't be field-filtered.
  // The 12 fields are the observed record (probe 2026-09-26).
  "openapi/simplecdrs-list": {
    jsonFields: [
      "sc_te_id",
      "tenantcode",
      "sc_start",
      "sc_direction",
      "sc_calleridnum",
      "sc_calleridname",
      "sc_dialednum",
      "sc_disposition",
      "sc_duration",
      "sc_billsec",
      "sc_uniqueid",
      "sc_whoanswered",
    ],
    forcedQuery: { format: "json" },
    excludedParams: ["format", "template", "contenttype"],
    tenantField: "tenantcode",
    dateRange: { start: "start", end: "end", maxDays: 7 },
    errorEnvelope: true,
    paramPatterns: {
      tenant: /^[\p{L}\p{N}_.-]{1,64}$/u,
      start: /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/,
      end: /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/,
      id: list("\\d{1,12}"),
      uniqueid: list("([A-Za-z0-9_]+-)?\\d+\\.\\d+"),
      calleridnum: list(DIGITS),
      calleridname: list(NAME, "u"),
      dialednum: list(DIGITS),
      phone: list(DIGITS),
      whoanswered: list("[\\p{L}\\p{N}_.@/-]{1,64}", "u"),
      disposition: list("[A-Z][A-Z ]{0,19}"),
      direction: list("[A-Z]{1,10}"),
      minduration: /^\d{1,6}$/,
      mintalktime: /^\d{1,6}$/,
    },
  },
} as const satisfies Record<string, LivePolicy>;

type LiveEndpointId = keyof typeof LIVE_POLICIES;

/**
 * Exact base URLs a Live target may resolve under. Checked against the
 * content model at load; no env value or caller input can change them.
 */
const ALLOWED_BASES = new Set(["https://pbx6webserver.1com.co.il", "https://pbx6webserver.1com.co.il/pbx/openapi.php"]);

/** Where the caller's key travels upstream. Header auth is limited to this one name. */
const HEADER_CREDENTIALS = new Set(["X-API-Key"]);

/** Never caller-settable as a query parameter, whatever the endpoint documents: alternate key transports. */
const RESERVED_QUERY = ["key"];

const APIS: Readonly<Record<string, ApiDefinition>> = { [proxyApi.id]: proxyApi, [openapiApi.id]: openapiApi };

export interface LiveTarget {
  /** `${api}/${endpoint}`, e.g. "proxy/info-extensions". */
  id: string;
  origin: string;
  /** Full upstream path: the API base path (if any) plus the endpoint path. */
  path: string;
  method: "GET";
  fixedQuery: Readonly<Record<string, string>>;
  /** Caller-settable query parameters. Everything else is rejected. */
  allowedParams: ReadonlySet<string>;
  /** Documented parameters hidden from the caller in Live (see LivePolicy.excludedParams). */
  excludedParams: ReadonlySet<string>;
  /** For enum-typed params, the only values accepted (from the content model). */
  paramEnums: ReadonlyMap<string, ReadonlySet<string>>;
  /** Where the credential travels upstream (the documented contract). */
  credential: { location: "query" | "header"; name: string };
  /** Anchored patterns per parameter; see LIVE_POLICIES. */
  paramPatterns: ReadonlyMap<string, RegExp>;
  /** Only these fields survive in JSON output; see LIVE_POLICIES. */
  jsonFields: ReadonlySet<string>;
  tenantField: string | null;
  dateRange: { start: string; end: string; maxDays: number } | null;
  errorEnvelope: boolean;
}

function baseOf(api: ApiDefinition): { origin: string; basePath: string } {
  const url = new URL(api.baseUrl);
  if (!ALLOWED_BASES.has(api.baseUrl) || url.search || url.hash || api.baseUrl.endsWith("/")) {
    throw new Error(`Live allowlist: ${api.id} base URL is not allowed`);
  }
  return { origin: url.origin, basePath: url.pathname === "/" ? "" : url.pathname };
}

function buildTarget(api: ApiDefinition, endpointId: string, policy: LivePolicy): LiveTarget {
  const endpoint = api.categories.flatMap((c) => c.endpoints).find((e) => e.id === endpointId);
  if (!endpoint) throw new Error(`Live allowlist: unknown endpoint ${api.id}/${endpointId}`);

  const { origin, basePath } = baseOf(api);
  if (endpoint.method !== "GET") throw new Error(`Live allowlist: ${endpointId} must be GET`);
  if (endpoint.operationClass === "write") throw new Error(`Live allowlist: ${endpointId} is a write`);
  if (!endpoint.path.startsWith("/") || endpoint.path.includes("{") || endpoint.path.includes("..")) {
    throw new Error(`Live allowlist: ${endpointId} needs a fixed absolute path`);
  }

  const auth = endpoint.authentication;
  const location = auth.location ?? "header";
  if (!auth.parameter || (location === "header" && !HEADER_CREDENTIALS.has(auth.parameter))) {
    throw new Error(`Live allowlist: ${endpointId} has an unsupported credential transport`);
  }

  const fixedQuery = { ...(endpoint.fixedQuery ?? {}), ...(policy.forcedQuery ?? {}) };
  const excludedParams = new Set(policy.excludedParams ?? []);
  const reserved = new Set([auth.parameter, ...RESERVED_QUERY, ...Object.keys(fixedQuery), ...excludedParams]);
  const allowedQuery = endpoint.queryParameters.filter((p) => !reserved.has(p.name));
  const allowedParams = new Set(allowedQuery.map((p) => p.name));
  for (const name of excludedParams) {
    if (!endpoint.queryParameters.some((p) => p.name === name)) {
      throw new Error(`Live allowlist: ${endpointId} excludes undocumented param ${name}`);
    }
  }
  if (policy.dateRange) {
    for (const name of [policy.dateRange.start, policy.dateRange.end]) {
      if (!allowedParams.has(name)) throw new Error(`Live allowlist: ${endpointId} date range uses non-allowed param ${name}`);
    }
  }
  if (policy.tenantField && !policy.jsonFields.includes(policy.tenantField)) {
    throw new Error(`Live allowlist: ${endpointId} tenant field must be an allowlisted JSON field`);
  }
  const paramEnums = new Map(
    allowedQuery.filter((p) => p.enum && p.enum.length > 0).map((p) => [p.name, new Set(p.enum)] as const),
  );

  const paramPatterns = new Map(Object.entries(policy.paramPatterns ?? {}));
  for (const [name, re] of paramPatterns) {
    if (!allowedParams.has(name)) throw new Error(`Live allowlist: ${endpointId} pattern for non-allowed param ${name}`);
    // Whole-value match only: `m` would let ^/$ match per line; g/y make test() stateful.
    if (!re.source.startsWith("^") || !re.source.endsWith("$") || re.multiline || re.global || re.sticky) {
      throw new Error(`Live allowlist: ${endpointId} pattern for ${name} must be anchored and stateless`);
    }
  }

  return Object.freeze({
    id: `${api.id}/${endpoint.id}`,
    origin,
    path: basePath + endpoint.path,
    method: "GET" as const,
    fixedQuery: Object.freeze(fixedQuery),
    allowedParams,
    excludedParams,
    paramEnums,
    credential: Object.freeze({ location, name: auth.parameter }),
    paramPatterns,
    jsonFields: new Set(policy.jsonFields),
    tenantField: policy.tenantField ?? null,
    dateRange: policy.dateRange ? Object.freeze({ ...policy.dateRange }) : null,
    errorEnvelope: policy.errorEnvelope ?? false,
  });
}

const targets: ReadonlyMap<string, LiveTarget> = new Map(
  (Object.keys(LIVE_POLICIES) as LiveEndpointId[]).map((id) => {
    const [apiId, endpointId] = id.split("/");
    const api = Object.hasOwn(APIS, apiId) ? APIS[apiId] : undefined;
    if (!api) throw new Error(`Live allowlist: unknown API ${apiId}`);
    return [id, buildTarget(api, endpointId, LIVE_POLICIES[id] as LivePolicy)] as const;
  }),
);

/** Exact-match lookup; never pattern-based. */
export function getLiveTarget(id: string): LiveTarget | undefined {
  return targets.get(id);
}

/** Every allowlisted target id, e.g. for telling the Playground which endpoints can go Live. */
export function listLiveTargetIds(): string[] {
  return [...targets.keys()];
}

/** Per Live target, the documented parameters the Playground must hide in Live mode. */
export function listLiveHiddenParams(): Record<string, string[]> {
  return Object.fromEntries([...targets.values()].map((t) => [t.id, [...t.excludedParams]]));
}
