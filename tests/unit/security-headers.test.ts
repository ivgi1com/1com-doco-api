import { describe, expect, it } from "vitest";
import { contentSecurityPolicy, securityHeaders } from "@/lib/security-headers";

// Phase 9 Stage 3: CSP "lockdown" (exfiltration lock; inline scripts allowed).
describe("security headers", () => {
  it("pins the production CSP", () => {
    expect(contentSecurityPolicy(false)).toBe(
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; " +
        "base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
    );
  });

  it("never allows eval, WebSockets or another origin in production", () => {
    const csp = contentSecurityPolicy(false);
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).not.toMatch(/ws:|https?:|\*/);
  });

  it("adds only unsafe-eval and ws: in development", () => {
    const prod = contentSecurityPolicy(false).split("; ");
    const dev = contentSecurityPolicy(true).split("; ");
    const changed = dev.filter((d, i) => d !== prod[i]);
    expect(changed).toEqual(["script-src 'self' 'unsafe-inline' 'unsafe-eval'", "connect-src 'self' ws:"]);
  });

  it("sends the related headers", () => {
    expect(Object.fromEntries(securityHeaders(false).map((h) => [h.key, h.value]))).toMatchObject({
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
    });
  });
});
