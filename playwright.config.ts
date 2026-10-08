import { defineConfig, devices } from "@playwright/test";

const PORT = 3000;
// Optional sub-path deployment, e.g. NEXT_PUBLIC_BASE_PATH=/1com-api-doco.
// Tests use paths relative to baseURL ("./en"), so the trailing slash matters.
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/\/+$/, "") ?? "";
const ORIGIN = `http://localhost:${PORT}`;
const BASE_URL = `${ORIGIN}${BASE_PATH}/`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium-desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-safari", use: { ...devices["iPhone 14"] } },
  ],
  webServer: {
    command: "npm run build && npm run start",
    // Live proxying is on so tests can exercise the real allowlist/UI wiring
    // for proxy/info-extensions. This is still safe: every test that sends a
    // Live request first installs a `page.route("**/api/playground", ...)`
    // mock, which intercepts the browser's request before it ever reaches
    // this server — no test may send a real, unmocked Live request. The one
    // exception is tests/e2e/live-real.spec.ts, which is skipped unless the
    // user exports a TEST key in their own shell (see that file's header).
    env: { PLAYGROUND_LIVE_ENABLED: "true" },
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
