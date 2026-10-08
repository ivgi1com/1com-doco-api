import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

import { BASE_PATH } from "./src/lib/base-path";
import { securityHeaders } from "./src/lib/security-headers";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Sub-path deployment (e.g. "/1com-api-doco"); build-time, empty at root.
  basePath: BASE_PATH || undefined,
  // CSP + related headers on every route (src/lib/security-headers.ts).
  // `source` is matched under basePath automatically.
  // Hebrew was removed (2026-10-08): old /he addresses go to the same English page.
  async redirects() {
    return [
      { source: "/he", destination: "/en", permanent: true },
      { source: "/he/:path*", destination: "/en/:path*", permanent: true },
    ];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders(process.env.NODE_ENV !== "production") }];
  },
  // Do NOT add `logging.fetches`: Next's dev fetch logger prints outbound
  // URLs, and the Live Playground's upstream URL carries the caller's API
  // key as a query parameter (docs/SECURITY.md). Pinned by a unit test.
};

export default withNextIntl(nextConfig);
