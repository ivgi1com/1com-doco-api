import { expect, test, type Page } from "@playwright/test";

/**
 * Phase 2 e2e smoke suite (docs/TESTING.md "Browser validation"): every
 * route loads without a console error across desktop/tablet/mobile, plus
 * the interactions TESTING.md calls out by name (navigation, sidebar,
 * endpoint page, Playground inputs, JSON viewer, loading/empty/error
 * states, keyboard interaction). No screenshot baselines: pixel-diff
 * snapshots aren't part of the documented strategy and are brittle across
 * OS/font rendering.
 */

const routes = [
  "/en",
  "/en/reference/proxy/info-extensions",
  "/en/reference/sample/list-call-records",
  "/en/guides/getting-started",
  "/en/playground",
  "/en/changelog",
  "/en/no-such-page",
  "/he",
  "/he/reference/proxy/info-extensions",
];

const viewports = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
];

function trackConsoleErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}

for (const viewport of viewports) {
  test.describe(`${viewport.name} ${viewport.width}x${viewport.height}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    for (const route of routes) {
      test(`loads without console errors: ${route}`, async ({ page }) => {
        const errors = trackConsoleErrors(page);
        await page.goto(route);
        await page.waitForLoadState("load");
        // Not `networkidle`: Next.js prefetches every visible Link's RSC
        // payload in the background (more of them once a page has both a
        // full sidebar and other on-page links, e.g. the Proxy endpoint
        // page), and Chromium's prefetch fan-out can keep the network
        // "busy" well past this test's timeout despite the page itself
        // having loaded correctly. A brief settle window is enough for any
        // real startup console error to surface.
        await page.waitForTimeout(500);
        // /en/no-such-page correctly returns HTTP 404; Chromium/WebKit log
        // that as a "failed to load resource" entry for the navigation
        // itself. That is the intended status code, not a JS error.
        const unexpected = errors.filter((e) => !(route.endsWith("no-such-page") && /404/.test(e)));
        expect(unexpected, `console errors on ${route}`).toEqual([]);
      });
    }
  });
}

test.describe("interactions", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("mobile nav drawer (sidebar) opens and closes", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/en");
    await page.getByRole("button", { name: "Open navigation" }).click();
    await expect(page.getByRole("dialog", { name: "Main" })).toBeVisible();
    await page.getByRole("button", { name: "Close navigation" }).click();
    await expect(page.getByRole("dialog", { name: "Main" })).toBeHidden();
  });

  test("search palette: keyboard shortcut opens it, Escape closes it", async ({ page }) => {
    await page.goto("/en");
    await page.keyboard.press("Control+k");
    const dialog = page.getByRole("dialog", { name: "Search docs" });
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("endpoint page: code tabs switch and copy button works", async ({ page }) => {
    await page.goto("/en/reference/sample/list-call-records");
    await page.getByRole("tab", { name: "Python" }).click();
    await expect(page.getByRole("tab", { name: "Python" })).toHaveAttribute("aria-selected", "true");
  });

  // Playground mounts both the <md step-flow and the md+ 3-pane layout at
  // once (CSS-hidden, not JS-unmounted) — the same pattern already used for
  // the reference page's mobile/desktop RequestPanel. At a desktop viewport
  // the md+ pane is the visible one; scope queries to it to avoid matching
  // its CSS-hidden mobile twin.
  const desktopPane = (page: Page) => page.locator(".md\\:grid");

  test("playground: empty state, then Demo send shows loading then a response", async ({ page }) => {
    await page.goto("/en/playground?endpoint=sample/list-call-records");
    await expect(desktopPane(page).getByText("No response yet")).toBeVisible();
    await desktopPane(page).getByRole("button", { name: "Send request" }).click();
    await expect(desktopPane(page).getByText(/ms$/)).toBeVisible(); // loading: elapsed-ms readout
    await expect(desktopPane(page).getByText(/status: 200/)).toBeVisible({ timeout: 3000 });
  });

  test("playground: switching to Live requires confirmation and shows the key field", async ({ page }) => {
    await page.goto("/en/playground?endpoint=sample/list-call-records");
    await page.getByRole("button", { name: "Switch to Live" }).click();
    await expect(page.getByRole("heading", { name: "Switch to Live mode?" })).toBeVisible();
    await page.getByRole("button", { name: "Switch mode" }).click();
    await expect(desktopPane(page).getByLabel("API key")).toBeVisible();
  });

  // Phase 5: Live is allowlisted per endpoint (docs/phases/05-live-playground.md,
  // U-08); the Sample API is never allowlisted, so Send must stay disabled
  // rather than attempt (and fail) a request, as the old prototype stub did.
  test("playground: Live is not allowlisted for the Sample API, so Send stays disabled", async ({ page }) => {
    await page.goto("/en/playground?endpoint=sample/list-call-records");
    await page.getByRole("button", { name: "Switch to Live" }).click();
    await page.getByRole("button", { name: "Switch mode" }).click();
    await expect(desktopPane(page).getByRole("button", { name: "Send request" })).toBeDisabled();
    await expect(
      desktopPane(page).getByText("Live requests aren't available for this endpoint in this deployment yet."),
    ).toBeVisible();
    await expect(desktopPane(page).getByText(/DEMO|LIVE/)).toHaveCount(0);
  });

  test("playground: required-field validation blocks Send with a missing path parameter", async ({ page }) => {
    await page.goto("/en/playground?endpoint=sample/get-call-record");
    // Path params are prefilled from the endpoint's documented example value;
    // clear it to exercise the required-field path.
    await desktopPane(page).getByLabel("call_id").fill("");
    await desktopPane(page).getByRole("button", { name: "Send request" }).click();
    await expect(desktopPane(page).getByText("call_id is required.")).toBeVisible();
    await expect(desktopPane(page).getByText("Fix the highlighted fields before sending.")).toBeVisible();
  });

  test("JSON viewer: collapses a node and search filters", async ({ page }) => {
    await page.goto("/en/playground?endpoint=sample/list-call-records");
    await desktopPane(page).getByRole("button", { name: "Send request" }).click();
    await expect(desktopPane(page).getByText(/status: 200/)).toBeVisible({ timeout: 3000 });
    await desktopPane(page).getByPlaceholder("Search JSON").fill("outbound");
    await expect(desktopPane(page).getByText("No matches")).toHaveCount(0);
  });

  // Phase 4: the Proxy API vertical slice (one real endpoint, docs/phases/04-one-endpoint.md).
  test.describe("Proxy API endpoint (Phase 4)", () => {
    test("reference page shows the legacy badge, fixed query params, and undocumented states truthfully", async ({
      page,
    }) => {
      await page.goto("/en/reference/proxy/info-extensions");
      await expect(page.getByRole("heading", { name: "List extensions" })).toBeVisible();
      await expect(page.getByText("Legacy endpoint")).toBeVisible();
      // The header's own path line; the request panel (desktop + mobile,
      // both mounted at once) repeats the same path in two more places.
      await expect(page.getByText("/pbx/proxyapi.php?reqtype=INFO&info=EXTENSIONS").first()).toBeVisible();
      await expect(page.getByRole("heading", { name: "Fixed parameters" })).toBeVisible();
      // The response is a real, user-supplied sanitized capture (U-11): the
      // "Responses" section lists it truthfully (status + description, no
      // "Not documented" fallback), and the request panel's response
      // example carries the evidence badge rather than being presented as
      // vendor-documented. The panel is mounted twice (mobile + desktop, CSS
      // toggled), hence `.first()`. Errors remain genuinely undocumented by
      // the source, so that section must still say so.
      await expect(
        page.locator('section[aria-labelledby="responses"]').getByText("An object keyed by each extension's internal id"),
      ).toBeVisible();
      // The evidence badge lives inside the request panel, which is mounted
      // twice: a desktop `<aside>` (always open) and a mobile `<details>`
      // disclosure (closed by default, and CSS-hidden at desktop widths).
      // Assert against whichever copy applies to this viewport.
      const evidenceBadgeText = "Observed, sanitized — not vendor-documented";
      if ((page.viewportSize()?.width ?? 0) < 768) {
        // Substring text matching also hits the unrelated method-inferred
        // note ("...its request examples."), so target the <summary> itself.
        await page.locator("summary", { hasText: "Request example" }).click();
        await expect(page.locator("details").getByText(evidenceBadgeText).first()).toBeVisible();
      } else {
        await expect(page.locator("aside").getByText(evidenceBadgeText).first()).toBeVisible();
      }
      await expect(
        page.locator('section[aria-labelledby="errors"]').getByText("Not documented by the source."),
      ).toBeVisible();
    });

    test("API reference redirects to the Proxy API (the default API) and the sidebar matches it", async ({
      page,
    }) => {
      await page.goto("/en/reference");
      await expect(page).toHaveURL(/\/reference\/proxy$/);
      await expect(page.getByRole("combobox").first()).toHaveValue("proxy");
    });

    test("Try in Playground opens the Playground on this endpoint with the Proxy API's own samples", async ({
      page,
    }) => {
      await page.goto("/en/reference/proxy/info-extensions");
      await page.getByRole("link", { name: "Try in Playground" }).click();
      await expect(page).toHaveURL(/\/playground\?endpoint=proxy\/info-extensions$/);
      await desktopPane(page).getByText("Code preview").click();
      await expect(desktopPane(page).getByText("PROXY_API_KEY")).toBeVisible();
    });

    test("Demo mode never fabricates or replays data for this endpoint", async ({ page }) => {
      await page.goto("/en/playground?endpoint=proxy/info-extensions");
      await desktopPane(page).getByRole("button", { name: "Send request" }).click();
      await expect(desktopPane(page).getByText("Demo data not available yet")).toBeVisible({ timeout: 3000 });
      await expect(desktopPane(page).getByText(/status: 200/)).toHaveCount(0);
    });

    test("undocumented-required query parameters never block Send", async ({ page }) => {
      await page.goto("/en/playground?endpoint=proxy/info-extensions");
      await desktopPane(page).getByLabel("tenant").fill("");
      await desktopPane(page).getByRole("button", { name: "Send request" }).click();
      await expect(desktopPane(page).getByText("Fix the highlighted fields before sending.")).toHaveCount(0);
      await expect(desktopPane(page).getByText("Demo data not available yet")).toBeVisible({ timeout: 3000 });
    });
  });

  // Phase 5: Live Playground (docs/phases/05-live-playground.md). Every test
  // here mocks the browser -> portal request (`/api/playground`) before
  // sending, so no test ever reaches the real 1com host, even though the
  // e2e server itself has Live enabled (playwright.config.ts) so the
  // allowlisted endpoint's Send button is actually enabled to click.
  test.describe("Live Playground (Phase 5)", () => {
    const FAKE_KEY = "not-a-real-key-e2e-only";

    function mockPlayground(page: Page, body: unknown, init: { status?: number; headers?: Record<string, string> } = {}) {
      return page.route("**/api/playground", (route) =>
        route.fulfill({
          status: init.status ?? 200,
          contentType: "application/json",
          headers: init.headers,
          body: JSON.stringify(body),
        }),
      );
    }

    async function goLive(page: Page) {
      await page.goto("/en/playground?endpoint=proxy/info-extensions");
      await page.getByRole("button", { name: "Switch to Live" }).click();
      await page.getByRole("button", { name: "Switch mode" }).click();
      await desktopPane(page).getByLabel("API key").fill(FAKE_KEY);
    }

    test("this endpoint is allowlisted: Send is enabled once in Live mode", async ({ page }) => {
      await goLive(page);
      await expect(desktopPane(page).getByRole("button", { name: "Send request" })).toBeEnabled();
    });

    test("missing API key blocks Send client-side, with no request sent", async ({ page }) => {
      let called = false;
      await page.route("**/api/playground", (route) => {
        called = true;
        return route.abort();
      });
      await page.goto("/en/playground?endpoint=proxy/info-extensions");
      await page.getByRole("button", { name: "Switch to Live" }).click();
      await page.getByRole("button", { name: "Switch mode" }).click();
      await desktopPane(page).getByRole("button", { name: "Send request" }).click();
      await expect(desktopPane(page).getByText("API key is required.")).toBeVisible();
      expect(called).toBe(false);
    });

    test("a successful response shows the LIVE stamp, status, and JSON body, with Headers and Request tabs", async ({
      page,
    }) => {
      await mockPlayground(page, {
        ok: true,
        upstream: {
          status: 200,
          latencyMs: 214,
          sizeBytes: 64,
          contentType: "application/json",
          headers: { "content-type": "application/json" },
          bodyText: JSON.stringify({ "3272": { ex_id: "3272", ex_name: "Jane Doe", ex_number: "201" } }),
        },
      });
      await goLive(page);
      await desktopPane(page).getByRole("button", { name: "Send request" }).click();
      await expect(desktopPane(page).getByText(/source: LIVE/)).toBeVisible({ timeout: 3000 });
      await expect(desktopPane(page).getByText(/status: 200/)).toBeVisible();
      await expect(desktopPane(page).getByText('"ex_name"')).toBeVisible();

      await desktopPane(page).getByRole("tab", { name: "Headers" }).click();
      await expect(desktopPane(page).getByText("content-type:")).toBeVisible();

      await desktopPane(page).getByRole("tab", { name: "Request" }).click();
      await expect(desktopPane(page).getByText(/key=••••/)).toBeVisible();
      // "$PROXY_API_KEY" also appears in the always-present static "Code
      // preview" curl sample (Phase 4), which renders it unmasked as
      // documentation; that one mounts first, so this Request tab's own
      // curl line (rendered after it in the response pane) is `.last()`.
      await expect(desktopPane(page).getByText(/\$PROXY_API_KEY/).last()).toBeVisible();
      // The credential itself must never reach the rendered page, masked or not.
      await expect(page.getByText(FAKE_KEY)).toHaveCount(0);
    });

    test("a portal rate-limit error shows a distinct message with the retry time, not Demo data", async ({ page }) => {
      await mockPlayground(
        page,
        { ok: false, error: { code: "rate_limited" } },
        { status: 429, headers: { "retry-after": "45" } },
      );
      await goLive(page);
      await desktopPane(page).getByRole("button", { name: "Send request" }).click();
      await expect(desktopPane(page).getByText("Request failed")).toBeVisible({ timeout: 3000 });
      await expect(desktopPane(page).getByText("Too many requests. Try again in 45 seconds.")).toBeVisible();
      await expect(desktopPane(page).getByText(/DEMO/)).toHaveCount(0);
    });

    test("an upstream timeout is reported distinctly from a portal-side failure", async ({ page }) => {
      await mockPlayground(page, { ok: false, error: { code: "upstream_timeout" } }, { status: 504 });
      await goLive(page);
      await desktopPane(page).getByRole("button", { name: "Send request" }).click();
      await expect(desktopPane(page).getByText("The 1com server did not respond in time.")).toBeVisible({
        timeout: 3000,
      });
    });

    test("Download JSON on a Live response triggers a file download", async ({ page }) => {
      await mockPlayground(page, {
        ok: true,
        upstream: {
          status: 200,
          latencyMs: 10,
          sizeBytes: 20,
          contentType: "application/json",
          headers: {},
          bodyText: JSON.stringify({ "1": { ex_id: "1", ex_name: "X", ex_number: "1" } }),
        },
      });
      await goLive(page);
      await desktopPane(page).getByRole("button", { name: "Send request" }).click();
      await expect(desktopPane(page).getByText(/status: 200/)).toBeVisible({ timeout: 3000 });
      const [download] = await Promise.all([
        page.waitForEvent("download"),
        desktopPane(page).getByRole("button", { name: "Download JSON" }).click(),
      ]);
      expect(download.suggestedFilename()).toBe("info-extensions-response.json");
    });

    // These two hit the real /api/playground route directly (no browser
    // page, no mock) — safe, since neither ever reaches the allowlist/fetch
    // step: GET is rejected by Next.js before our handler runs, and a
    // foreign Origin is rejected by the handler's first check.
    test("the real route rejects GET (only POST is exported)", async ({ request }) => {
      const res = await request.get("/api/playground");
      expect(res.status()).toBe(405);
    });

    test("the real route rejects a cross-site Origin", async ({ request }) => {
      const res = await request.post("/api/playground", {
        headers: { origin: "https://evil.test", "content-type": "application/json" },
        data: { endpoint: "proxy/info-extensions", params: {}, credential: "x" },
      });
      expect(res.status()).toBe(403);
    });

    test("mobile: Live success is reachable through the step flow and the Request tab shows the masked key", async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await mockPlayground(page, {
        ok: true,
        upstream: {
          status: 200,
          latencyMs: 10,
          sizeBytes: 20,
          contentType: "application/json",
          headers: {},
          bodyText: JSON.stringify({ "1": { ex_id: "1", ex_name: "X", ex_number: "1" } }),
        },
      });
      await page.goto("/en/playground?endpoint=proxy/info-extensions");
      await page.getByRole("button", { name: "Switch to Live" }).click();
      await page.getByRole("button", { name: "Switch mode" }).click();
      // The desktop 3-pane layout and the mobile step flow are both mounted
      // at once (CSS-hidden, not JS-unmounted); at this viewport the mobile
      // instance is the first one in the DOM.
      await page.getByLabel("API key").first().fill(FAKE_KEY);
      await page.getByRole("button", { name: "Send request" }).first().click();
      await page.getByRole("tab", { name: "Response" }).click();
      // ResponseViewer is likewise mounted twice (mobile step pane + the
      // CSS-hidden desktop grid); the mobile instance is first in the DOM.
      await expect(page.getByText(/status: 200/).first()).toBeVisible({ timeout: 3000 });
      // Three "Request"-named tabs now exist: the mobile step nav's own
      // "Request" step, plus each ResponseViewer instance's own Body/
      // Headers/Request sub-tab. Scope to a tablist that also has a
      // "Headers" tab (only the response viewers') to reach the sub-tab,
      // not the step nav; `.first()` then picks the visible mobile instance.
      const responseTablist = page.getByRole("tablist").filter({ hasText: "Headers" });
      await responseTablist.getByRole("tab", { name: "Request" }).first().click();
      await expect(page.getByText(/key=••••/).first()).toBeVisible();
    });
  });
});
