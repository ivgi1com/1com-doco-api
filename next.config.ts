import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Do NOT add `logging.fetches`: Next's dev fetch logger prints outbound
  // URLs, and the Live Playground's upstream URL carries the caller's API
  // key as a query parameter (docs/SECURITY.md). Pinned by a unit test.
};

export default withNextIntl(nextConfig);
