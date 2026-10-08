import "server-only";

import type { LiveUpstream, PortalErrorCode } from "@/lib/playground-protocol";
import type { LiveRequest } from "./validate";

/** Upstream response headers that may be shown to the caller. Everything else is dropped. */
const EXPOSED_HEADERS = ["content-type", "content-length", "date", "cache-control"] as const;


export type UpstreamErrorCode = Extract<PortalErrorCode, `upstream_${string}`>;

export type ExecuteResult =
  | { ok: true; upstream: LiveUpstream }
  | { ok: false; code: UpstreamErrorCode; latencyMs: number };

export interface ExecuteOptions {
  timeoutMs: number;
  maxResponseBytes: number;
  fetch?: typeof fetch;
  now?: () => number;
}

/**
 * Builds the upstream URL from the allowlisted target only. The caller never
 * supplies a host or path. Order: fixed operation selectors, parameters,
 * then — for query-auth APIs only — the credential (U-08). A header-auth key
 * never enters the URL (see buildUpstreamHeaders).
 */
export function buildUpstreamUrl({ target, params, credential }: LiveRequest): URL {
  const url = new URL(target.path, target.origin);
  const query = new URLSearchParams();
  for (const [k, v] of Object.entries(target.fixedQuery)) query.set(k, v);
  for (const [k, v] of Object.entries(params)) query.set(k, v);
  if (target.credential.location === "query") query.set(target.credential.name, credential);
  url.search = query.toString();
  if (url.origin !== target.origin || url.pathname !== target.path) {
    throw new Error("Live target resolved outside its allowlisted origin/path");
  }
  return url;
}

export function buildUpstreamHeaders({ target, credential }: LiveRequest): Record<string, string> {
  const headers: Record<string, string> = { accept: "application/json, text/plain;q=0.9, */*;q=0.1" };
  if (target.credential.location === "header") headers[target.credential.name.toLowerCase()] = credential;
  return headers;
}

class TooLargeError extends Error {}

async function readCapped(body: ReadableStream<Uint8Array> | null, maxBytes: number) {
  if (!body) return { bytes: new Uint8Array(0) };
  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel().catch(() => {});
      throw new TooLargeError();
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    bytes.set(c, offset);
    offset += c.byteLength;
  }
  return { bytes };
}

/**
 * Performs the one upstream call. Errors are mapped to fixed codes and the
 * original error is discarded: Node's fetch errors can embed the request
 * URL or headers, and either may carry the credential.
 */
export async function executeLive(request: LiveRequest, options: ExecuteOptions): Promise<ExecuteResult> {
  const doFetch = options.fetch ?? fetch;
  const now = options.now ?? (() => performance.now());
  const started = now();
  const elapsed = () => Math.round(now() - started);
  const signal = AbortSignal.timeout(options.timeoutMs);

  try {
    const url = buildUpstreamUrl(request);
    const res = await doFetch(url, {
      method: request.target.method,
      redirect: "manual",
      cache: "no-store",
      credentials: "omit",
      headers: buildUpstreamHeaders(request),
      signal,
    });

    if (res.type === "opaqueredirect" || (res.status >= 300 && res.status < 400)) {
      await res.body?.cancel().catch(() => {});
      return { ok: false, code: "upstream_redirect", latencyMs: elapsed() };
    }

    const declared = Number(res.headers.get("content-length"));
    if (Number.isFinite(declared) && declared > options.maxResponseBytes) {
      await res.body?.cancel().catch(() => {});
      return { ok: false, code: "upstream_too_large", latencyMs: elapsed() };
    }

    const { bytes } = await readCapped(res.body, options.maxResponseBytes);
    const headers: Record<string, string> = {};
    for (const name of EXPOSED_HEADERS) {
      const value = res.headers.get(name);
      if (value !== null) headers[name] = value;
    }

    return {
      ok: true,
      upstream: {
        status: res.status,
        latencyMs: elapsed(),
        sizeBytes: bytes.byteLength,
        contentType: res.headers.get("content-type"),
        headers,
        bodyText: new TextDecoder("utf-8").decode(bytes),
        redactedCount: 0,
        fieldsOmitted: 0,
      },
    };
  } catch (err) {
    if (err instanceof TooLargeError) return { ok: false, code: "upstream_too_large", latencyMs: elapsed() };
    if (signal.aborted) return { ok: false, code: "upstream_timeout", latencyMs: elapsed() };
    return { ok: false, code: "upstream_unreachable", latencyMs: elapsed() };
  }
}
