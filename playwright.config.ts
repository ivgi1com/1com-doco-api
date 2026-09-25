import { defineConfig, devices } from "@playwright/test";

const PORT = 3000;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: `http://localhost:${PORT}`,
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
    // this server — no test may send a real, unmocked Live request.
    env: { PLAYGROUND_LIVE_ENABLED: "true" },
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
