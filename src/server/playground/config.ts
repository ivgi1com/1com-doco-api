import "server-only";

/**
 * Live Playground proxy limits (docs/SECURITY.md "Backend proxy requirements").
 * Every value has a safe default and a hard ceiling: an env var can tighten a
 * limit or relax it up to the ceiling, never past it. The upstream host is
 * deliberately NOT configurable here — it comes from the content model
 * (see allowlist.ts), so no env value can point the proxy somewhere else.
 */
export interface PlaygroundConfig {
  /** Kill switch. Off unless PLAYGROUND_LIVE_ENABLED is exactly "true". */
  liveEnabled: boolean;
  timeoutMs: number;
  maxResponseBytes: number;
  /** Requests per client per rolling minute. */
  rateLimitPerMinute: number;
  /**
   * Lower-cased request header holding the client IP, set by a reverse proxy
   * the deployment trusts. Unset: no header is trusted and every caller
   * shares one rate-limit bucket (safe, but strict).
   */
  trustedIpHeader: string | null;
  /** Maximum accepted size of the browser -> portal JSON request body. */
  maxRequestBytes: number;
}

const LIMITS = {
  timeoutMs: { fallback: 10_000, min: 1_000, max: 30_000 },
  maxResponseBytes: { fallback: 1_048_576, min: 1_024, max: 5_242_880 },
  rateLimitPerMinute: { fallback: 10, min: 1, max: 60 },
} as const;

function boundedInt(raw: string | undefined, limit: { fallback: number; min: number; max: number }) {
  if (raw === undefined || !/^\d+$/.test(raw.trim())) return limit.fallback;
  const n = Number(raw.trim());
  return Math.min(limit.max, Math.max(limit.min, n));
}

function headerName(raw: string | undefined): string | null {
  const name = raw?.trim().toLowerCase();
  // RFC 9110 token characters only; anything else is treated as unset.
  return name && /^[a-z0-9!#$%&'*+.^_`|~-]+$/.test(name) ? name : null;
}

export function getPlaygroundConfig(env: Record<string, string | undefined> = process.env): PlaygroundConfig {
  return {
    liveEnabled: env.PLAYGROUND_LIVE_ENABLED === "true",
    timeoutMs: boundedInt(env.PLAYGROUND_REQUEST_TIMEOUT_MS, LIMITS.timeoutMs),
    maxResponseBytes: boundedInt(env.PLAYGROUND_MAX_RESPONSE_BYTES, LIMITS.maxResponseBytes),
    rateLimitPerMinute: boundedInt(env.PLAYGROUND_RATE_LIMIT, LIMITS.rateLimitPerMinute),
    trustedIpHeader: headerName(env.PLAYGROUND_TRUSTED_IP_HEADER),
    maxRequestBytes: 8_192,
  };
}
