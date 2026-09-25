import "server-only";

import { proxyApi } from "@/content/proxy-api";
import type { ApiDefinition } from "@/content/types";

/**
 * The only destinations the Live proxy may ever reach, each with its own
 * output and input policy. Adding an entry here is a security decision, not a
 * content change — see docs/SECURITY.md and docs/DECISIONS.md.
 *
 * - info-extensions: U-08 (2026-09-25).
 * - info-agents, cdr-get: Phase 5 adjustment (2026-09-25, A-42/A-43).
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
}

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
} as const satisfies Record<string, LivePolicy>;

type LiveEndpointId = keyof typeof LIVE_POLICIES;

/** Hosts a Live target may resolve to. Checked against the content model at load. */
const ALLOWED_ORIGINS = new Set(["https://pbx6webserver.1com.co.il"]);

export interface LiveTarget {
  /** `${api}/${endpoint}`, e.g. "proxy/info-extensions". */
  id: string;
  origin: string;
  path: string;
  method: "GET";
  fixedQuery: Readonly<Record<string, string>>;
  /** Caller-settable query parameters. Everything else is rejected. */
  allowedParams: ReadonlySet<string>;
  /** For enum-typed params, the only values accepted (from the content model). */
  paramEnums: ReadonlyMap<string, ReadonlySet<string>>;
  /** Query parameter the credential travels in upstream (the documented contract). */
  credentialParam: string;
  /** Anchored patterns per parameter; see LIVE_POLICIES. */
  paramPatterns: ReadonlyMap<string, RegExp>;
  /** Only these fields survive in JSON output; see LIVE_POLICIES. */
  jsonFields: ReadonlySet<string>;
}

function buildTarget(api: ApiDefinition, endpointId: string, policy: LivePolicy): LiveTarget {
  const endpoint = api.categories.flatMap((c) => c.endpoints).find((e) => e.id === endpointId);
  if (!endpoint) throw new Error(`Live allowlist: unknown endpoint ${api.id}/${endpointId}`);

  const origin = new URL(api.baseUrl).origin;
  if (!ALLOWED_ORIGINS.has(origin) || origin !== api.baseUrl) {
    throw new Error(`Live allowlist: ${api.id} base URL is not an allowed origin`);
  }
  if (endpoint.method !== "GET") throw new Error(`Live allowlist: ${endpointId} must be GET`);
  if (!endpoint.path.startsWith("/") || endpoint.path.includes("{")) {
    throw new Error(`Live allowlist: ${endpointId} needs a fixed absolute path`);
  }

  const auth = endpoint.authentication;
  if (auth.location !== "query" || !auth.parameter) {
    throw new Error(`Live allowlist: ${endpointId} must use query-parameter auth`);
  }

  const fixedQuery = { ...(endpoint.fixedQuery ?? {}) };
  const reserved = new Set([auth.parameter, ...Object.keys(fixedQuery)]);
  const allowedQuery = endpoint.queryParameters.filter((p) => !reserved.has(p.name));
  const allowedParams = new Set(allowedQuery.map((p) => p.name));
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
    path: endpoint.path,
    method: "GET" as const,
    fixedQuery: Object.freeze(fixedQuery),
    allowedParams,
    paramEnums,
    credentialParam: auth.parameter,
    paramPatterns,
    jsonFields: new Set(policy.jsonFields),
  });
}

const targets: ReadonlyMap<string, LiveTarget> = new Map(
  (Object.keys(LIVE_POLICIES) as LiveEndpointId[]).map((id) => {
    const [apiId, endpointId] = id.split("/");
    if (apiId !== proxyApi.id) throw new Error(`Live allowlist: unknown API ${apiId}`);
    return [id, buildTarget(proxyApi, endpointId, LIVE_POLICIES[id])] as const;
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
