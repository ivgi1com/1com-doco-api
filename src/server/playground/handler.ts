import "server-only";

import type { LiveResponseBody, PortalErrorCode } from "@/lib/playground-protocol";
import type { PlaygroundConfig } from "./config";
import { executeLive } from "./execute";
import { logLive } from "./log";
import { countDistinctField, projectErrorEnvelope, projectJsonFields, redactSensitive } from "./redact";
import { clientKey, type RateLimiter } from "./rate-limit";
import { validateLiveRequest } from "./validate";

const STATUS: Record<PortalErrorCode, number> = {
  live_disabled: 503,
  forbidden_origin: 403,
  unsupported_media_type: 415,
  payload_too_large: 413,
  rate_limited: 429,
  invalid_request: 400,
  endpoint_not_allowed: 403,
  missing_credential: 400,
  range_too_wide: 400,
  multi_tenant_blocked: 403,
  upstream_timeout: 504,
  upstream_too_large: 502,
  upstream_redirect: 502,
  upstream_unreachable: 502,
};

const BASE_HEADERS = {
  "cache-control": "no-store",
  "x-content-type-options": "nosniff",
  "content-type": "application/json; charset=utf-8",
};

function portalError(code: PortalErrorCode, extra: Record<string, string> = {}) {
  const body: LiveResponseBody = { ok: false, error: { code } };
  return new Response(JSON.stringify(body), {
    status: STATUS[code],
    headers: { ...BASE_HEADERS, ...extra },
  });
}

/**
 * CSRF / cross-site-use guard. Browsers always send Origin on a POST fetch;
 * it must match the Host the request was addressed to. Not an authentication
 * control — non-browser callers can forge both — which is why rate limiting
 * and the caller's own 1com key are the remaining controls.
 */
function isSameOrigin(headers: Headers): boolean {
  const site = headers.get("sec-fetch-site");
  if (site !== null && site !== "same-origin") return false;
  const origin = headers.get("origin");
  const host = headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

async function readBodyCapped(request: Request, maxBytes: number): Promise<string | null> {
  const declared = Number(request.headers.get("content-length"));
  if (Number.isFinite(declared) && declared > maxBytes) return null;
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel().catch(() => {});
      return null;
    }
    chunks.push(value);
  }
  const decoder = new TextDecoder("utf-8");
  return chunks.map((c) => decoder.decode(c, { stream: true })).join("") + decoder.decode();
}

export interface HandlerDeps {
  config: PlaygroundConfig;
  limiter: RateLimiter;
  fetch?: typeof fetch;
  log?: (line: string) => void;
}

export async function handleLiveRequest(request: Request, deps: HandlerDeps): Promise<Response> {
  const { config, limiter } = deps;
  const log = (entry: Parameters<typeof logLive>[0]) => logLive(entry, deps.log);

  if (!config.liveEnabled) return portalError("live_disabled");
  if (!isSameOrigin(request.headers)) {
    log({ endpoint: "unknown", outcome: "forbidden_origin" });
    return portalError("forbidden_origin");
  }

  const mediaType = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  if (mediaType !== "application/json") return portalError("unsupported_media_type");

  // Counted before parsing, so malformed requests (and key guessing) spend budget too.
  const limit = limiter.consume(clientKey(request.headers, config.trustedIpHeader));
  if (!limit.allowed) {
    log({ endpoint: "unknown", outcome: "rate_limited" });
    return portalError("rate_limited", { "retry-after": String(limit.retryAfterSeconds) });
  }

  let raw: string | null;
  try {
    raw = await readBodyCapped(request, config.maxRequestBytes);
  } catch {
    // Client aborted mid-body or the stream errored; fail closed with a fixed code.
    return portalError("invalid_request");
  }
  if (raw === null) return portalError("payload_too_large");

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return portalError("invalid_request");
  }

  const validation = validateLiveRequest(parsed);
  if (!validation.ok) {
    log({ endpoint: "unknown", outcome: validation.code });
    return portalError(validation.code);
  }

  const endpointId = validation.value.target.id;
  const result = await executeLive(validation.value, {
    timeoutMs: config.timeoutMs,
    maxResponseBytes: config.maxResponseBytes,
    fetch: deps.fetch,
  });

  if (!result.ok) {
    log({ endpoint: endpointId, outcome: result.code, latencyMs: result.latencyMs });
    return portalError(result.code);
  }

  // Nothing sensitive leaves the server (A-40 decisions): JSON is cut down to
  // the target's field allowlist (or, for an error envelope, to its code and
  // message), then credential-like values are redacted as a second layer
  // (which also covers the plain-text table). Pass-through targets (Phase 10)
  // skip the field allowlist; redaction is then the only output control.
  const target = validation.value.target;
  const projection =
    (target.errorEnvelope ? projectErrorEnvelope(result.upstream.bodyText) : null) ??
    (target.projection === "passthrough"
      ? { text: result.upstream.bodyText, omittedFields: 0, withheld: false }
      : projectJsonFields(result.upstream.bodyText, target.jsonFields));
  // An answer spanning several tenants means a non-tenant (admin) key: block
  // all of it rather than show other customers' records (Phase 9 decision).
  if (target.tenantField && countDistinctField(projection.text, target.tenantField) > 1) {
    log({ endpoint: endpointId, outcome: "multi_tenant_blocked", status: result.upstream.status, latencyMs: result.upstream.latencyMs });
    return portalError("multi_tenant_blocked");
  }
  const redaction = projection.withheld ? { text: projection.text, redacted: -1 } : redactSensitive(projection.text, validation.value.credential);
  const upstream = {
    ...result.upstream,
    bodyText: redaction.text,
    redactedCount: redaction.redacted,
    fieldsOmitted: projection.omittedFields,
  };
  log({
    endpoint: endpointId,
    outcome: "upstream_response",
    status: upstream.status,
    latencyMs: upstream.latencyMs,
    sizeBytes: upstream.sizeBytes,
  });
  // The portal call itself succeeded; the upstream status (2xx or not) is
  // reported as data, never re-mapped.
  const body: LiveResponseBody = { ok: true, upstream };
  return new Response(JSON.stringify(body), { status: 200, headers: BASE_HEADERS });
}
