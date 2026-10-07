import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

import { BASE_PATH } from "./src/lib/base-path";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // Sub-path deployment (e.g. "/1com-api-doco"); build-time, empty at root.
  basePath: BASE_PATH || undefined,
  // Do NOT add `logging.fetches`: Next's dev fetch logger prints outbound
  // URLs, and the Live Playground's upstream URL carries the caller's API
  // key as a query parameter (docs/SECURITY.md). Pinned by a unit test.
};

export default withNextIntl(nextConfig);
