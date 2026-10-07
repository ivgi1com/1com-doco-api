/**
 * Deployment sub-path (e.g. "/1com-api-doco"), baked in at build time from
 * NEXT_PUBLIC_BASE_PATH. Empty when the portal is served from the domain root.
 * next.config.ts applies it as Next's `basePath`; this helper covers the URLs
 * Next does not prefix on its own (raw fetch, raw CSS url()).
 *
 * The property access must stay a literal `process.env.NEXT_PUBLIC_BASE_PATH`
 * so Next can inline it into the client bundle.
 */
export function normalizeBasePath(raw: string | undefined): string {
  const value = (raw ?? "").trim();
  if (value === "" || value === "/") return "";
  if (!/^\/[A-Za-z0-9._~-]+(\/[A-Za-z0-9._~-]+)*$/.test(value)) {
    throw new Error(`NEXT_PUBLIC_BASE_PATH must look like "/segment" (no trailing slash): ${value}`);
  }
  return value;
}

export const BASE_PATH = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH);

export function withBasePath(path: string): string {
  return `${BASE_PATH}${path}`;
}
