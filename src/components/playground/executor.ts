import { getDemoFixtures, isDemoSimulatedWrite, resolveDemoCase } from "@/content/demo";
import type { ApiDefinition, Endpoint } from "@/content/types";
import { byteSize } from "@/lib/json-path";
import {
  LIVE_ROUTE,
  type LiveRequestBody,
  type LiveResponseBody,
  type PortalErrorCode,
} from "@/lib/playground-protocol";

/**
 * Execution layer (docs/ARCHITECTURE.md): the Playground UI consumes one
 * contract; Demo and Live are separate providers with no path between them.
 * A Live failure is always reported as a Live failure — never answered with
 * Demo data.
 */

/** What was sent, with the credential masked. Safe to render and copy. */
export interface SanitizedRequest {
  method: string;
  url: string;
  /** Request headers that carry the credential, masked (header-auth APIs only). */
  headers?: Record<string, string>;
}

export type LiveErrorCode = PortalErrorCode | "portal_unreachable" | "invalid_portal_response";

export type PlaygroundResponse =
  | {
      source: "DEMO";
      unavailable?: false;
      notSimulated?: false;
      status: number;
      latencyMs: number;
      sizeBytes: number;
      requestId: string;
      format: "json" | "text";
      contentType: string;
      body: unknown;
      /** Present when a fixture case resolved this response (executor.ts demoProvider). Absent for the Sample API's own synthetic examples. */
      caseLabel?: string;
      basis?: string;
      /** What the equivalent Live request would look like. Never actually sent. */
      request: SanitizedRequest;
    }
  // A non-synthetic API with no fixture set for this endpoint has no Demo
  // data at all (must never replay a real observed response — the Evidence
  // rule, API_CONTENT_MODEL.md).
  | { source: "DEMO"; unavailable: true; notSimulated?: false }
  // A fixture set exists for this endpoint, but no case matches this exact
  // input combination — never guessed, shown as "Not simulated".
  | { source: "DEMO"; notSimulated: true; unavailable?: false; request: SanitizedRequest }
  | {
      source: "LIVE";
      kind: "response";
      status: number;
      latencyMs: number;
      sizeBytes: number;
      contentType: string | null;
      headers: Record<string, string>;
      /** Values the portal redacted; -1 if the whole body was withheld. */
      redactedCount: number;
      /** Distinct upstream JSON fields the portal's allowlist removed. */
      fieldsOmitted: number;
      format: "json" | "text";
      body: unknown;
      request: SanitizedRequest;
    }
  | {
      source: "LIVE";
      kind: "portal-error";
      code: LiveErrorCode;
      retryAfterSeconds?: number;
      request: SanitizedRequest;
    };

export interface ExecuteRequest {
  api: ApiDefinition;
  endpoint: Endpoint;
  /** Keyed `${location}:${name}` (see use-playground.ts fieldKey). */
  fieldValues: Record<string, string>;
  credential: string;
  simulateError: boolean;
}

export interface ApiExecutor {
  execute(request: ExecuteRequest, signal: AbortSignal): Promise<PlaygroundResponse>;
}

export const MASK = "••••";

/** Non-empty query values the user entered, trimmed. */
export function liveQueryParams(endpoint: Endpoint, fieldValues: Record<string, string>) {
  const params: Record<string, string> = {};
  for (const p of endpoint.queryParameters) {
    const v = fieldValues[`query:${p.name}`]?.trim();
    if (v) params[p.name] = v;
  }
  return params;
}

/** The endpoint path with each entered path-parameter value substituted; empty values keep their `{name}` placeholder. */
export function substitutePathParams(endpoint: Endpoint, fieldValues: Record<string, string>): string {
  return endpoint.pathParameters.reduce((path, p) => {
    const v = fieldValues[`path:${p.name}`]?.trim();
    return v ? path.replaceAll(`{${p.name}}`, v) : path;
  }, endpoint.path);
}

/** Mirrors the server's upstream URL order (fixed selectors, params, credential), credential masked. */
export function sanitizedRequest(api: ApiDefinition, endpoint: Endpoint, fieldValues: Record<string, string>): SanitizedRequest {
  const query = new URLSearchParams(endpoint.fixedQuery ?? {});
  for (const [k, v] of Object.entries(liveQueryParams(endpoint, fieldValues))) query.set(k, v);
  const auth = endpoint.authentication;
  let search = query.toString();
  let headers: Record<string, string> | undefined;
  if (auth.location === "query" && auth.parameter) {
    search += `${search ? "&" : ""}${encodeURIComponent(auth.parameter)}=${MASK}`;
  } else if (auth.parameter) {
    headers = { [auth.parameter]: MASK };
  } else {
    headers = { Authorization: `Bearer ${MASK}` };
  }
  const url = `${api.baseUrl}${substitutePathParams(endpoint, fieldValues)}${search ? `?${search}` : ""}`;
  return { method: endpoint.method, url, ...(headers ? { headers } : {}) };
}

/** A copy-pasteable curl line for a sanitized request, credential swapped for its env var. */
export function curlEquivalent(request: SanitizedRequest, envVar: string): string {
  const unmask = (s: string) => s.split(MASK).join(`$${envVar}`);
  const method = request.method === "GET" ? "" : `-X ${request.method} `;
  const headers = Object.entries(request.headers ?? {})
    .map(([k, v]) => ` -H "${k}: ${unmask(v)}"`)
    .join("");
  return `curl ${method}"${unmask(request.url)}"${headers}`;
}

function parseBody(text: string): { format: "json" | "text"; body: unknown } {
  if (text.trim() === "") return { format: "text", body: text };
  try {
    return { format: "json", body: JSON.parse(text) };
  } catch {
    return { format: "text", body: text };
  }
}

export const liveProvider: ApiExecutor = {
  async execute({ api, endpoint, fieldValues, credential }, signal) {
    const request = sanitizedRequest(api, endpoint, fieldValues);
    // SEC-REQ-27: Live never sends a write. The UI and the server allowlist
    // (GET-only) already block this; this is the client-side last layer.
    if (endpoint.operationClass === "write") {
      return { source: "LIVE", kind: "portal-error", code: "endpoint_not_allowed", request };
    }
    const payload: LiveRequestBody = {
      endpoint: `${api.id}/${endpoint.id}`,
      params: liveQueryParams(endpoint, fieldValues),
      credential,
    };

    let res: Response;
    try {
      // Credential travels only in this same-origin POST body — never in a
      // browser-visible URL, query string, or header.
      res = await fetch(LIVE_ROUTE, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "same-origin",
        cache: "no-store",
        signal,
      });
    } catch (err) {
      if (signal.aborted) throw err;
      return { source: "LIVE", kind: "portal-error", code: "portal_unreachable", request };
    }

    let data: LiveResponseBody;
    try {
      data = (await res.json()) as LiveResponseBody;
    } catch (err) {
      if (signal.aborted) throw err;
      return { source: "LIVE", kind: "portal-error", code: "invalid_portal_response", request };
    }

    if (!data || typeof data !== "object" || typeof data.ok !== "boolean") {
      return { source: "LIVE", kind: "portal-error", code: "invalid_portal_response", request };
    }
    if (!data.ok) {
      const retry = Number(res.headers.get("retry-after"));
      return {
        source: "LIVE",
        kind: "portal-error",
        code: data.error?.code ?? "invalid_portal_response",
        retryAfterSeconds: Number.isFinite(retry) && retry > 0 ? retry : undefined,
        request,
      };
    }

    const { upstream } = data;
    return {
      source: "LIVE",
      kind: "response",
      status: upstream.status,
      latencyMs: upstream.latencyMs,
      sizeBytes: upstream.sizeBytes,
      contentType: upstream.contentType,
      headers: upstream.headers,
      redactedCount: typeof upstream.redactedCount === "number" ? upstream.redactedCount : 0,
      fieldsOmitted: typeof upstream.fieldsOmitted === "number" ? upstream.fieldsOmitted : 0,
      ...parseBody(upstream.bodyText),
      request,
    };
  },
};

function randomId(prefix: string) {
  const bytes = new Uint8Array(6);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) crypto.getRandomValues(bytes);
  return `${prefix}_${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}`;
}

function delay(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const id = setTimeout(resolve, ms);
    signal.addEventListener(
      "abort",
      () => {
        clearTimeout(id);
        reject(signal.reason);
      },
      { once: true },
    );
  });
}

/** `format: "text"` bodies are already text; byteSize's JSON.stringify would over-count (and misreport 0 bytes as 2). */
function demoBodySize(format: "json" | "text", body: unknown): number {
  return format === "text" ? new TextEncoder().encode(String(body)).length : byteSize(body);
}

/** Never makes a network request. */
export const demoProvider: ApiExecutor = {
  async execute({ api, endpoint, fieldValues, simulateError }, signal) {
    await delay(400 + Math.random() * 500, signal);
    const request = sanitizedRequest(api, endpoint, fieldValues);

    // Writes are Reference-only (types.ts OperationClass) unless SEC-REQ-27's
    // documented-example Demo applies (isDemoSimulatedWrite); a fixture added
    // by mistake on any other API still never answers.
    if (endpoint.operationClass === "write" && !isDemoSimulatedWrite(api.id, endpoint)) {
      return { source: "DEMO", unavailable: true };
    }

    const fixtures = getDemoFixtures(api.id, endpoint.id);
    if (fixtures) {
      const resolved = resolveDemoCase(fixtures, liveQueryParams(endpoint, fieldValues));
      if (!resolved) return { source: "DEMO", notSimulated: true, request };
      const { response } = resolved;
      return {
        source: "DEMO",
        status: response.status,
        latencyMs: Math.round(180 + Math.random() * 460),
        sizeBytes: demoBodySize(response.format, response.body),
        requestId: randomId("req_demo"),
        format: response.format,
        contentType: response.contentType,
        body: response.body,
        caseLabel: resolved.label,
        basis: resolved.basis,
        request,
      };
    }

    if (!api.synthetic) return { source: "DEMO", unavailable: true };
    const success = endpoint.responses.find((r) => r.status < 300);
    const failure = endpoint.responses.find((r) => r.status >= 400);
    const chosen = (simulateError && failure) || success || endpoint.responses[0];
    const body = chosen?.example ?? null;
    return {
      source: "DEMO",
      status: chosen?.status ?? 200,
      latencyMs: Math.round(180 + Math.random() * 460),
      sizeBytes: byteSize(body),
      requestId: randomId("req_demo"),
      format: "json",
      contentType: "application/json",
      body,
      request,
    };
  },
};
