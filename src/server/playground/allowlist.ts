import "server-only";

import { proxyApi } from "@/content/proxy-api";
import type { ApiDefinition } from "@/content/types";

/**
 * The only destinations the Live proxy may ever reach (U-08, decided
 * 2026-09-25: INFO/EXTENSIONS only). Adding an entry here is a security
 * decision, not a content change — see docs/SECURITY.md.
 */
const LIVE_ENDPOINTS = ["proxy/info-extensions"] as const;

/**
 * JSON output fields the Live proxy may return per item (decided 2026-09-25
 * after A-40: format=json is a 148-field config record incl. credentials,
 * 2FA params, PINs and PII). Mirrors the plain-format columns minus
 * Password. Everything else is dropped server-side before redaction runs as
 * a second layer. Must match the documented response schema (unit-tested).
 */
const JSON_FIELD_ALLOWLIST: Record<(typeof LIVE_ENDPOINTS)[number], readonly string[]> = {
  "proxy/info-extensions": ["ex_id", "ex_number", "ex_name", "ex_tech", "st_state", "username"],
};

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
  /** Only these fields survive in JSON output; see JSON_FIELD_ALLOWLIST. */
  jsonFields: ReadonlySet<string>;
}

function buildTarget(api: ApiDefinition, endpointId: string, jsonFields: readonly string[]): LiveTarget {
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

  return Object.freeze({
    id: `${api.id}/${endpoint.id}`,
    origin,
    path: endpoint.path,
    method: "GET" as const,
    fixedQuery: Object.freeze(fixedQuery),
    allowedParams,
    paramEnums,
    credentialParam: auth.parameter,
    jsonFields: new Set(jsonFields),
  });
}

const targets: ReadonlyMap<string, LiveTarget> = new Map(
  LIVE_ENDPOINTS.map((id) => {
    const [apiId, endpointId] = id.split("/");
    if (apiId !== proxyApi.id) throw new Error(`Live allowlist: unknown API ${apiId}`);
    return [id, buildTarget(proxyApi, endpointId, JSON_FIELD_ALLOWLIST[id])] as const;
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
