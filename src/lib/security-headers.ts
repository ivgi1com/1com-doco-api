/**
 * Response headers for every portal route (next.config.ts), Phase 9.
 *
 * The CSP is an exfiltration lock, not an injection block (user decision
 * 2026-10-08: keep pages statically pre-rendered, so no per-request nonce).
 * Inline scripts stay allowed — the theme-init script and Next's own
 * bootstrap need them — but nothing on the page can load from, send to, or
 * be framed by any other origin. The Live API key and Live responses
 * therefore cannot leave the page by fetch, image, font, form or frame.
 * Everything the portal serves is same-origin: fonts are self-hosted by
 * next/font, and there are no third-party scripts, styles or images.
 *
 * Development additionally needs `'unsafe-eval'` (React dev tooling) and
 * WebSockets (hot reload); production never gets either.
 */
export function contentSecurityPolicy(dev: boolean): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data:",
    "font-src 'self'",
    `connect-src 'self'${dev ? " ws:" : ""}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
}

export function securityHeaders(dev: boolean): { key: string; value: string }[] {
  return [
    { key: "Content-Security-Policy", value: contentSecurityPolicy(dev) },
    { key: "Referrer-Policy", value: "no-referrer" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    // Legacy browsers that ignore frame-ancestors.
    { key: "X-Frame-Options", value: "DENY" },
  ];
}
