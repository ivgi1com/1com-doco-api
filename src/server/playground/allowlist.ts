import "server-only";

import { proxyApi } from "@/content/proxy-api";
import type { ApiDefinition } from "@/content/types";

/**
 * The only destinations the Live proxy may ever reach (U-08, decided
 * 2026-09-25: INFO/EXTENSIONS only). Adding an entry here is a security
 * decision, not a content change — see docs/SECURITY.md.
 */
const LIVE_ENDPOINTS = ["proxy/info-extensions"] as const;

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
  /** Query parameter the credential travels in upstream (the documented contract). */
  credentialParam: string;
}

function buildTarget(api: ApiDefinition, endpointId: string): LiveTarget {
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
  const allowedParams = new Set(
    endpoint.queryParameters.map((p) => p.name).filter((name) => !reserved.has(name)),
  );

  return Object.freeze({
    id: `${api.id}/${endpoint.id}`,
    origin,
    path: endpoint.path,
    method: "GET" as const,
    fixedQuery: Object.freeze(fixedQuery),
    allowedParams,
    credentialParam: auth.parameter,
  });
}

const targets: ReadonlyMap<string, LiveTarget> = new Map(
  LIVE_ENDPOINTS.map((id) => {
    const [apiId, endpointId] = id.split("/");
    if (apiId !== proxyApi.id) throw new Error(`Live allowlist: unknown API ${apiId}`);
    return [id, buildTarget(proxyApi, endpointId)] as const;
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
