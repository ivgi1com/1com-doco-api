import "server-only";

import type { LiveResponseBody, PortalErrorCode } from "@/lib/playground-protocol";
import type { PlaygroundConfig } from "./config";
import { executeLive } from "./execute";
import { logLive } from "./log";
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

  const raw = await readBodyCapped(request, config.maxRequestBytes);
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

  const { upstream } = result;
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
