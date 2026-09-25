import "server-only";

export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSeconds: number };

/**
 * Swappable so a shared store (e.g. Redis) can replace the in-memory one at
 * deployment time without touching the route (docs/SECURITY.md).
 */
export interface RateLimiter {
  consume(key: string): RateLimitResult;
}

/**
 * Sliding-window log, per process. LIMITATION: state is per instance and
 * resets on restart, so N instances allow N x the limit. Adequate for a
 * single long-lived Node process; not for serverless or multi-instance.
 */
export function createMemoryRateLimiter(options: {
  limit: number;
  windowMs: number;
  maxKeys?: number;
  now?: () => number;
}): RateLimiter {
  const { limit, windowMs } = options;
  const maxKeys = options.maxKeys ?? 10_000;
  const now = options.now ?? Date.now;
  const hits = new Map<string, number[]>();

  return {
    consume(key) {
      const t = now();
      const recent = (hits.get(key) ?? []).filter((ts) => t - ts < windowMs);
      if (recent.length >= limit) {
        hits.set(key, recent);
        return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((recent[0] + windowMs - t) / 1000)) };
      }
      recent.push(t);
      // Re-insert so Map order tracks recency; evict the least recent key when full.
      hits.delete(key);
      hits.set(key, recent);
      if (hits.size > maxKeys) {
        const oldest = hits.keys().next().value;
        if (oldest !== undefined) hits.delete(oldest);
      }
      return { allowed: true };
    },
  };
}

/**
 * Client key for rate limiting. Only the configured trusted header is read;
 * for a comma-separated list the right-most entry is used (the one appended
 * by the nearest proxy — left-most entries are client-controlled). Without a
 * trusted header every caller shares one bucket.
 */
export function clientKey(headers: Headers, trustedIpHeader: string | null): string {
  if (!trustedIpHeader) return "global";
  const raw = headers.get(trustedIpHeader);
  const last = raw?.split(",").pop()?.trim();
  return last && last.length <= 64 ? `ip:${last}` : "unknown";
}
