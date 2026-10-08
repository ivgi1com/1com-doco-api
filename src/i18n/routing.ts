import { defineRouting } from "next-intl/routing";

// English only (Hebrew removed 2026-10-08). The `/en` prefix stays so existing
// links keep working; old `/he/...` addresses redirect to `/en/...` (next.config.ts).
export const routing = defineRouting({
  locales: ["en"],
  defaultLocale: "en",
  localePrefix: "always",
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
