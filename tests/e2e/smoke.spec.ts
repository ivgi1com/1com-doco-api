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
  "./en",
  "./en/reference/proxy/info-extensions",
  "./en/reference/sample/list-call-records",
  "./en/guides/getting-started",
  "./en/playground",
  "./en/no-such-page",
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

  test("the header and drawer show neither Console nor Changelog, and the route is gone (8E)", async ({ page }) => {
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("./en");
      if (width < 640) {
        const dialog = page.getByRole("dialog", { name: "Main" });
        await expect(async () => {
          await page.getByRole("button", { name: "Open navigation" }).click();
          await expect(dialog).toBeVisible({ timeout: 500 });
        }).toPass({ timeout: 10_000 });
        await expect(dialog.getByRole("link", { name: "Changelog" })).toHaveCount(0);
      }
      await expect(page.getByRole("link", { name: "Changelog" })).toHaveCount(0);
      await expect(page.getByText("Console", { exact: true })).toHaveCount(0);
      await expect(page.getByText("Console is not available yet")).toHaveCount(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)).toBe(false);
    }
    const res = await page.goto("./en/changelog");
    expect(res?.status()).toBe(404);
  });

  test("mobile nav drawer (sidebar) opens and closes", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("./en");
    const dialog = page.getByRole("dialog", { name: "Main" });
    // Same hydration race as the search-palette test below: a locator
    // .click() retries the click itself until the element is actionable,
    // but that doesn't wait for this button's onClick (wired up by React
    // after hydration) to actually be attached — a click dispatched into
    // that pre-hydration window opens nothing, and a single subsequent
    // assertion then times out. Retry the click until the dialog opens.
    await expect(async () => {
      await page.getByRole("button", { name: "Open navigation" }).click();
      await expect(dialog).toBeVisible({ timeout: 500 });
    }).toPass({ timeout: 10_000 });
    await page.getByRole("button", { name: "Close navigation" }).click();
    await expect(dialog).toBeHidden();
  });

  test("search palette: keyboard shortcut opens it, Escape closes it", async ({ page }) => {
    await page.goto("./en");
    const dialog = page.getByRole("dialog", { name: "Search docs" });
    // SearchPalette wires up its document keydown listener in a useEffect,
    // which only runs after hydration. page.keyboard.press is a single
    // fire-and-forget keystroke (unlike a locator action, it has no
    // actionability retry), so a press sent in the pre-hydration window is
    // silently lost — this is what made this test flaky specifically under
    // full-suite parallel load (heavier CPU contention delays hydration),
    // not a real product bug (no real user presses Ctrl+K within
    // milliseconds of navigation). Retry the press itself until the dialog
    // opens, rather than a single attempt or an arbitrary fixed sleep.
    await expect(async () => {
      await page.keyboard.press("Control+k");
      await expect(dialog).toBeVisible({ timeout: 500 });
    }).toPass({ timeout: 10_000 });
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("endpoint page: code tabs switch and copy button works", async ({ page }) => {
    await page.goto("./en/reference/sample/list-call-records");
    await page.getByRole("tab", { name: "Python" }).click();
    await expect(page.getByRole("tab", { name: "Python" })).toHaveAttribute("aria-selected", "true");
  });

  // Playground mounts both the <md step-flow and the md+ 3-pane layout at
  // once (CSS-hidden, not JS-unmounted) — the same pattern already used for
  // the reference page's mobile/desktop RequestPanel. At a desktop viewport
  // the md+ pane is the visible one; scope queries to it to avoid matching
  // its CSS-hidden mobile twin.
  const desktopPane = (page: Page) => page.locator(".md\\:grid");

  // The Reference page's own request panel is mounted twice (desktop
  // <aside>, mobile <details>); open and target whichever copy this
  // viewport shows. Shared by the Proxy and Open API reference-page tests.
  const requestPanel = async (page: Page) => {
    if ((page.viewportSize()?.width ?? 0) < 768) {
      await page.locator("summary", { hasText: "Request example" }).click();
      return page.locator("details").first();
    }
    return page.locator("aside");
  };

  test("playground: empty state, then Demo send shows loading then a response", async ({ page }) => {
    await page.goto("./en/playground?endpoint=sample/list-call-records");
    await expect(desktopPane(page).getByText("No response yet")).toBeVisible();
    await desktopPane(page).getByRole("button", { name: "Send request" }).click();
    await expect(desktopPane(page).getByText(/ms$/)).toBeVisible(); // loading: elapsed-ms readout
    await expect(desktopPane(page).getByText(/status: 200/)).toBeVisible({ timeout: 3000 });
  });

  test("playground: switching to Live requires confirmation and shows the key field", async ({ page }) => {
    // An allowlisted endpoint: the key field is shown only where Live can send (8C).
    await page.goto("./en/playground?endpoint=proxy/info-extensions");
    await page.getByRole("button", { name: "Switch to Live" }).click();
    await expect(page.getByRole("heading", { name: "Switch to Live mode?" })).toBeVisible();
    await page.getByRole("button", { name: "Switch mode" }).click();
    await expect(desktopPane(page).getByLabel("API key")).toBeVisible();
  });

  // Phase 5: Live is allowlisted per endpoint (docs/phases/05-live-playground.md,
  // U-08); the Sample API is never allowlisted, so Send must stay disabled
  // rather than attempt (and fail) a request, as the old prototype stub did.
  test("playground: Live is not allowlisted for the Sample API, so Send stays disabled", async ({ page }) => {
    await page.goto("./en/playground?endpoint=sample/list-call-records");
    await page.getByRole("button", { name: "Switch to Live" }).click();
    await page.getByRole("button", { name: "Switch mode" }).click();
    await expect(desktopPane(page).getByRole("button", { name: "Send request" })).toBeDisabled();
    await expect(desktopPane(page).getByText(/Live execution is not enabled for this operation/)).toBeVisible();
    // No key field where Live cannot send (8C): a key typed there would go nowhere.
    await expect(desktopPane(page).getByLabel("API key")).toHaveCount(0);
    await expect(desktopPane(page).getByText(/DEMO|LIVE/)).toHaveCount(0);
  });

  test("playground: required-field validation blocks Send with a missing path parameter", async ({ page }) => {
    await page.goto("./en/playground?endpoint=sample/get-call-record");
    // Path params are prefilled from the endpoint's documented example value;
    // clear it to exercise the required-field path.
    await desktopPane(page).getByLabel("call_id").fill("");
    await desktopPane(page).getByRole("button", { name: "Send request" }).click();
    await expect(desktopPane(page).getByText("call_id is required.")).toBeVisible();
    await expect(desktopPane(page).getByText("Fix the highlighted fields before sending.")).toBeVisible();
  });

  test("JSON viewer: collapses a node and search filters", async ({ page }) => {
    await page.goto("./en/playground?endpoint=sample/list-call-records");
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
      await page.goto("./en/reference/proxy/info-extensions");
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
        page.locator('section[aria-labelledby="responses"]').getByText(/With format=json: a JSON array, one object per extension/),
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
        await expect(page.locator("details").getByText("Observed sample", { exact: true }).first()).toBeVisible();
      } else {
        await expect(page.locator("aside").getByText(evidenceBadgeText).first()).toBeVisible();
        // The header chip is the short neutral label; the full wording is the caption.
        await expect(page.locator("aside").getByText("Observed sample", { exact: true }).first()).toBeVisible();
      }
      await expect(
        page.locator('section[aria-labelledby="errors"]').getByText("Not documented by the source."),
      ).toBeVisible();
    });

    test("API reference redirects to the Open API (the default API, 8E) and the sidebar matches it", async ({
      page,
    }) => {
      await page.goto("./en/reference");
      await expect(page).toHaveURL(/\/reference\/openapi$/);
      const select = page.getByRole("combobox").first();
      await expect(select).toHaveValue("openapi");
      await expect(select.locator("option")).toHaveText(["1com Open API", "Proxy API (legacy)", "Sample (prototype)"]);
    });

    test("the Playground opens on the Open API's Simple CDR by default (8E)", async ({ page }) => {
      await page.goto("./en/playground");
      await expect(desktopPane(page).getByLabel("API", { exact: true })).toHaveValue("openapi");
      await expect(desktopPane(page).getByTestId("operation-header")).toContainText("List simple CDRs");
      await expect(page.getByTestId("endpoint-not-found")).toHaveCount(0);
    });

    test("the home page lists Open API before the legacy Proxy API (8E)", async ({ page }) => {
      await page.goto("./en");
      const chips = page.getByLabel("APIs", { exact: true }).getByRole("link");
      await expect(chips).toHaveText(["1com Open API", "Proxy API (legacy)"]);
    });

    test("Guides open in Open API mode; Proxy guides only after selecting it (8E)", async ({ page, browserName }) => {
      await page.goto("./en/guides");
      await expect(page).toHaveURL(/\/guides\/openapi-authentication$/);
      const sidebar = page.locator("aside").first();
      const select = sidebar.getByRole("combobox");
      await expect(select).toHaveValue("openapi");
      await expect(select.locator("option")).toHaveText(["1com Open API", "Proxy API (legacy)", "Sample (prototype)"]);
      await expect(sidebar.getByRole("link", { name: "Most Used Cases" })).toBeVisible();
      await expect(sidebar.getByRole("link", { name: "Call history" })).toHaveCount(0);
      test.skip(browserName === "webkit", "Playwright/WebKit doesn't fire onChange for a React-controlled <select> via selectOption.");
      await select.selectOption("proxy");
      await expect(page).toHaveURL(/\/guides\/authentication$/);
      await expect(sidebar.getByRole("link", { name: "Call history" })).toBeVisible();
      await expect(sidebar.getByRole("link", { name: "Most Used Cases" })).toHaveCount(0);
    });

    test("the home Most Used Cases card and primary button lead to Open API guides (8E)", async ({ page }) => {
      await page.goto("./en");
      await expect(page.getByRole("link", { name: "Get started with the Open API" })).toHaveAttribute("href", /\/guides\/openapi-authentication$/);
      await page.getByRole("link", { name: /Most Used Cases/ }).click();
      await expect(page).toHaveURL(/\/guides\/most-used-cases$/);
      await expect(page.getByRole("heading", { level: 1, name: "Most Used Cases" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Click to Call" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "Viewing call history (CDRs)" })).toBeVisible();
    });

    test("Try in Playground opens the Playground on this endpoint with the Proxy API's own samples", async ({
      page,
    }) => {
      await page.goto("./en/reference/proxy/info-extensions");
      await page.getByRole("link", { name: "Try in Playground" }).click();
      await expect(page).toHaveURL(/\/playground\?endpoint=proxy\/info-extensions$/);
      await desktopPane(page).getByText("Code preview").click();
      // Scoped to the cURL tab panel: the Request preview (Phase 8C) renders
      // the same env var name in its own collapsed curl line.
      await expect(desktopPane(page).getByRole("tabpanel", { name: "cURL" }).getByText("$PROXY_API_KEY")).toBeVisible();
    });

    // info-extensions gained Demo fixtures in Phase 6 (see "Demo Mode (Phase
    // 6)" below); cdr-get still has none, so it's the one that still
    // exercises the no-fixture-set fallback ("unavailable" — never a
    // fabricated or replayed response).
    test("Demo mode never fabricates or replays data for an endpoint with no fixtures", async ({ page }) => {
      await page.goto("./en/playground?endpoint=proxy/cdr-get");
      await desktopPane(page).getByRole("button", { name: "Send request" }).click();
      await expect(desktopPane(page).getByText("Demo data not available yet")).toBeVisible({ timeout: 3000 });
      await expect(desktopPane(page).getByText(/status: 200/)).toHaveCount(0);
    });

    test("undocumented-required query parameters never block Send", async ({ page }) => {
      await page.goto("./en/playground?endpoint=proxy/cdr-get");
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
      await page.goto("./en/playground?endpoint=proxy/info-extensions");
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
      await page.goto("./en/playground?endpoint=proxy/info-extensions");
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
      // `.last()`: the request-pane Request preview (Phase 8C) precedes the response pane in the DOM.
      await expect(desktopPane(page).getByText(/key=••••/).last()).toBeVisible();
      // "$PROXY_API_KEY" also appears in the always-present static "Code
      // preview" curl sample (Phase 4), which renders it unmasked as
      // documentation; that one mounts first, so this Request tab's own
      // curl line (rendered after it in the response pane) is `.last()`.
      await expect(desktopPane(page).getByText(/\$PROXY_API_KEY/).last()).toBeVisible();
      // The credential itself must never reach the rendered page, masked or not.
      await expect(page.getByText(FAKE_KEY)).toHaveCount(0);
      // The GET request block and the cURL block each have their own label,
      // in the same visual style (UX fix: cURL previously had none). Both
      // "GET" (also the EndpointPicker/RequestBuilder method badges) and
      // "cURL" (also the static Code-preview language tab) appear more than
      // once in the DOM; this Request tab's own labels render last, same
      // reasoning as the $PROXY_API_KEY match above.
      await expect(desktopPane(page).getByText("GET", { exact: true }).last()).toBeVisible();
      await expect(desktopPane(page).getByText("cURL", { exact: true }).last()).toBeVisible();
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

    // Phase 5 adjustment (A-42/A-43): two more allowlisted endpoints.
    async function goLiveOn(page: Page, endpoint: string) {
      await page.goto(`./en/playground?endpoint=${endpoint}`);
      await page.getByRole("button", { name: "Switch to Live" }).click();
      await page.getByRole("button", { name: "Switch mode" }).click();
      await desktopPane(page).getByLabel("API key").fill(FAKE_KEY);
    }

    // Phase 9: openapi/simplecdrs-list is the first Open API operation that
    // can go Live. Every test mocks `/api/playground`; none reaches the PBX.
    test.describe("Open API Live pilot (Phase 9)", () => {
      const LIVE_OP = "openapi/simplecdrs-list";
      const rows = [
        { sc_te_id: "12", tenantcode: "TESTTENANT", sc_start: "2026-01-01 09:00:00", sc_direction: "IN", sc_calleridnum: "0500000000", sc_calleridname: "", sc_dialednum: "0300000000", sc_disposition: "ANSWERED", sc_duration: "30", sc_billsec: "25", sc_uniqueid: "1700000000.1", sc_whoanswered: "" },
      ];
      const upstream = (status: number, body: unknown) => ({
        ok: true,
        upstream: {
          status,
          latencyMs: 90,
          sizeBytes: 100,
          contentType: "application/json",
          headers: { "content-type": "application/json" },
          bodyText: JSON.stringify(body),
        },
      });

      test("opens in Demo; Live needs the confirmation, then shows the key field and an enabled Send", async ({ page }) => {
        await page.goto(`./en/playground?endpoint=${LIVE_OP}`);
        await expect(page.getByRole("button", { name: "Switch to Live" })).toBeVisible();
        await expect(desktopPane(page).getByLabel("API key")).toHaveCount(0);
        await page.getByRole("button", { name: "Switch to Live" }).click();
        await page.getByRole("button", { name: "Switch mode" }).click();
        await expect(desktopPane(page).getByLabel("API key")).toBeVisible();
        await expect(desktopPane(page).getByRole("button", { name: "Send request" })).toBeEnabled();
      });

      test("Live hides format, template and contenttype; Demo still shows them", async ({ page }) => {
        await page.goto(`./en/playground?endpoint=${LIVE_OP}`);
        for (const name of ["format", "template", "contenttype"]) {
          await expect(desktopPane(page).getByLabel(name, { exact: true })).toBeVisible();
        }
        await page.getByRole("button", { name: "Switch to Live" }).click();
        await page.getByRole("button", { name: "Switch mode" }).click();
        for (const name of ["format", "template", "contenttype"]) {
          await expect(desktopPane(page).getByLabel(name, { exact: true })).toHaveCount(0);
        }
        await expect(desktopPane(page).getByLabel("tenant", { exact: true })).toBeVisible();
        await expect(desktopPane(page).getByLabel("calleridnum", { exact: true })).toBeVisible();
      });

      test("the Live request preview shows format=json and a masked X-API-Key header, never the key", async ({ page }) => {
        await goLiveOn(page, LIVE_OP);
        const preview = desktopPane(page).getByTestId("request-preview");
        await preview.locator("summary").click();
        await expect(preview).toContainText("format=json");
        await expect(preview).toContainText("X-API-Key");
        await expect(preview).toContainText("••••");
        await expect(page.getByText(FAKE_KEY)).toHaveCount(0);
      });

      test("Send posts the endpoint, the entered filters and the key to the portal only, without format", async ({ page }) => {
        const posted: { endpoint: string; params: Record<string, string>; credential: string }[] = [];
        await page.route("**/api/playground", (route) => {
          posted.push(route.request().postDataJSON());
          return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(upstream(200, rows)) });
        });
        await goLiveOn(page, LIVE_OP);
        await desktopPane(page).getByLabel("tenant", { exact: true }).fill("MYTENANT");
        await desktopPane(page).getByRole("button", { name: "Send request" }).click();
        await expect(desktopPane(page).getByText(/source: LIVE/)).toBeVisible({ timeout: 3000 });
        await expect(desktopPane(page).getByText(/status: 200/)).toBeVisible();
        await expect(desktopPane(page).getByText('"sc_uniqueid"')).toBeVisible();
        expect(posted).toHaveLength(1);
        expect(posted[0].endpoint).toBe(LIVE_OP);
        expect(posted[0].credential).toBe(FAKE_KEY);
        expect(posted[0].params.tenant).toBe("MYTENANT");
        expect(Object.keys(posted[0].params)).not.toEqual(expect.arrayContaining(["format"]));
        expect(Object.keys(posted[0].params)).not.toEqual(expect.arrayContaining(["template"]));
        expect(Object.keys(posted[0].params)).not.toEqual(expect.arrayContaining(["contenttype"]));
      });

      test("an upstream error envelope is shown as the LIVE response with its status", async ({ page }) => {
        await mockPlayground(page, upstream(401, { error: { code: "invalid_api_key", message: "Invalid API key" } }));
        await goLiveOn(page, LIVE_OP);
        await desktopPane(page).getByRole("button", { name: "Send request" }).click();
        await expect(desktopPane(page).getByText(/status: 401/)).toBeVisible({ timeout: 3000 });
        await expect(desktopPane(page).getByText(/invalid_api_key/)).toBeVisible();
        await expect(desktopPane(page).getByText(/DEMO/)).toHaveCount(0);
      });

      test("a range over 3 days is reported as a portal error, not Demo data", async ({ page }) => {
        await mockPlayground(page, { ok: false, error: { code: "range_too_wide" } }, { status: 400 });
        await goLiveOn(page, LIVE_OP);
        await desktopPane(page).getByRole("button", { name: "Send request" }).click();
        await expect(desktopPane(page).getByText("Request failed")).toBeVisible({ timeout: 3000 });
        await expect(desktopPane(page).getByText(/at most 3 days/)).toBeVisible();
        await expect(desktopPane(page).getByText(/DEMO/)).toHaveCount(0);
      });

      test("an answer spanning several tenants is blocked with an explicit message and no records", async ({ page }) => {
        await mockPlayground(page, { ok: false, error: { code: "multi_tenant_blocked" } }, { status: 403 });
        await goLiveOn(page, LIVE_OP);
        await desktopPane(page).getByRole("button", { name: "Send request" }).click();
        await expect(desktopPane(page).getByText(/more than one tenant/)).toBeVisible({ timeout: 3000 });
        await expect(desktopPane(page).getByText('"sc_uniqueid"')).toHaveCount(0);
      });

      // Phase 10: every read is Live except the categorical blocks (call
      // content, Dial, DISA) and writes.
      for (const blocked of ["openapi/aianalysis-get", "openapi/disas-list", "openapi/queues-create"]) {
        test(`${blocked} stays Live-disabled (Phase 10)`, async ({ page }) => {
          await page.goto(`./en/playground?endpoint=${blocked}`);
          await page.getByRole("button", { name: "Switch to Live" }).click();
          await page.getByRole("button", { name: "Switch mode" }).click();
          await expect(desktopPane(page).getByRole("button", { name: "Send request" })).toBeDisabled();
          await expect(desktopPane(page).getByLabel("API key")).toHaveCount(0);
        });
      }

      test("a path-parameter read goes Live: tenant, key and id are sent to the portal only (Phase 10)", async ({ page }) => {
        const posted: { endpoint: string; params: Record<string, string>; pathParams?: Record<string, string>; credential: string }[] = [];
        await page.route("**/api/playground", (route) => {
          posted.push(route.request().postDataJSON());
          return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(upstream(200, { qu_id: "100", qu_name: "Support" })) });
        });
        await goLiveOn(page, "openapi/queues-get");
        await desktopPane(page).getByLabel("tenant", { exact: true }).fill("MYTENANT");
        await desktopPane(page).getByRole("textbox", { name: /^qu_id/ }).fill("100");
        const preview = desktopPane(page).getByTestId("request-preview");
        await preview.locator("summary").click();
        await expect(preview).toContainText("/queues/100");
        await expect(preview).toContainText("••••");
        await expect(page.getByText(FAKE_KEY)).toHaveCount(0);
        await desktopPane(page).getByRole("button", { name: "Send request" }).click();
        await expect(desktopPane(page).getByText(/source: LIVE/)).toBeVisible({ timeout: 3000 });
        await expect(desktopPane(page).getByText('"qu_name"')).toBeVisible();
        expect(posted).toHaveLength(1);
        expect(posted[0]).toMatchObject({
          endpoint: "openapi/queues-get",
          params: { tenant: "MYTENANT" },
          pathParams: { qu_id: "100" },
          credential: FAKE_KEY,
        });
      });

      test("the Live pilot works on a narrow screen without console errors", async ({ page }) => {
        const errors = trackConsoleErrors(page);
        await page.setViewportSize({ width: 390, height: 844 });
        await mockPlayground(page, upstream(200, rows));
        await page.goto(`./en/playground?endpoint=${LIVE_OP}`);
        // The mode bar sits above the stepped mobile layout.
        await expect(page.getByRole("button", { name: "Switch to Live" })).toBeVisible();
        await page.getByRole("button", { name: "Switch to Live" }).click();
        await page.getByRole("button", { name: "Switch mode" }).click();
        await expect(page.getByRole("button", { name: "Switch to Demo" })).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)).toBe(false);
        expect(errors).toEqual([]);
      });
    });

    // UX fix: tenant + API key are shared Live-mode context and must survive
    // switching endpoints via the sidebar (not a fresh page load); an
    // endpoint-specific field (id) must still reset normally.
    test("Live mode: tenant and API key survive an endpoint switch; endpoint-specific fields still reset", async ({
      page,
    }) => {
      await goLiveOn(page, "proxy/info-extensions");
      await desktopPane(page).getByLabel("tenant", { exact: true }).fill("MYTENANT");
      await desktopPane(page).getByLabel("id", { exact: true }).fill("999");

      // Substring match also hits the Phase 7 "List queue agents' answer
      // delay" endpoint; the negative lookahead excludes it without needing
      // the full "GET ... (Legacy)" accessible name.
      await desktopPane(page).getByRole("button", { name: /List queue agents(?!')/ }).click();
      await expect(page).toHaveURL(/endpoint=proxy\/info-agents$/);
      await expect(desktopPane(page).getByLabel("tenant", { exact: true })).toHaveValue("MYTENANT");
      await expect(desktopPane(page).getByLabel("API key")).toHaveValue(FAKE_KEY);
      await expect(desktopPane(page).getByLabel("id", { exact: true })).toHaveCount(0);
      // info-agents' own queue field shows its own documented default, not
      // anything carried over from the previous endpoint.
      await expect(desktopPane(page).getByLabel("queue", { exact: true })).toHaveValue("281");

      // Substring match also hits the Phase 7 ManageDB "List extensions
      // (ManageDB)" endpoint; the negative lookahead excludes it.
      await desktopPane(page).getByRole("button", { name: /List extensions(?! \(ManageDB\))/ }).click();
      await expect(page).toHaveURL(/endpoint=proxy\/info-extensions$/);
      await expect(desktopPane(page).getByLabel("tenant", { exact: true })).toHaveValue("MYTENANT");
      await expect(desktopPane(page).getByLabel("API key")).toHaveValue(FAKE_KEY);
      // id has no documented example: reset to empty, not the "999" from before.
      await expect(desktopPane(page).getByLabel("id", { exact: true })).toHaveValue("");
    });

    // UX fix: the JSON toolbar (Tree/Raw, Expand/Collapse, search, Copy,
    // Download) must stay visible while scrolling a long response, sticking
    // to the response panel's own scroll area, not the browser viewport.
    test("a long response keeps its toolbar visible and usable while scrolling", async ({ page }) => {
      const agents = Object.fromEntries(
        Array.from({ length: 60 }, (_, i) => [
          `${200 + i}-TENANTCODE`,
          { "0": "0", "1": "available", "2": "UNAVAILABLE", "10": `${200 + i}-TENANTCODE`, "11": `${200 + i}-TENANTCODE` },
        ]),
      );
      await mockPlayground(page, {
        ok: true,
        upstream: {
          status: 200,
          latencyMs: 12,
          sizeBytes: 4000,
          contentType: "application/json",
          headers: {},
          bodyText: JSON.stringify(agents),
        },
      });
      await goLiveOn(page, "proxy/info-agents");
      await desktopPane(page).getByLabel("queue", { exact: true }).fill("281");
      await desktopPane(page).getByRole("button", { name: "Send request" }).click();
      await expect(desktopPane(page).getByText(/status: 200/)).toBeVisible({ timeout: 3000 });

      // Scoped to the JSON toolbar itself: individual tree nodes reuse the
      // same "Collapse all"/"Expand all" strings as their own per-row
      // aria-label, so an unscoped role query matches dozens of elements.
      const toolbar = desktopPane(page).getByTestId("json-toolbar");
      // JsonViewer owns its own scroll region (a flex header + scrollable
      // content split, not CSS `position: sticky`) — this is the element
      // that actually scrolls, not response-viewer's outer tab panel.
      const content = desktopPane(page).getByTestId("json-content");
      await expect(toolbar).toBeInViewport();

      // The first JSON property must render fully below the toolbar, not
      // behind/inside it — a direct geometry check, not just "is it on
      // screen", since a z-index trick could pass toBeInViewport() alone.
      const firstRow = content.getByText('"0"', { exact: true }).first();
      const noOverlap = async () => {
        const toolbarBox = await toolbar.boundingBox();
        const rowBox = await firstRow.boundingBox();
        expect(toolbarBox && rowBox && rowBox.y >= toolbarBox.y + toolbarBox.height - 1).toBe(true);
      };
      await noOverlap();

      await content.evaluate((el) => el.scrollBy(0, 2000));
      await expect(toolbar).toBeInViewport();
      // The first entry (still in the DOM — scrolling never unmounts rows)
      // must have scrolled fully out of view, not sit clipped behind the
      // toolbar; and genuine internal scrolling actually happened (this is
      // JsonViewer's own scroll region, not a no-op on some other element).
      await expect(firstRow).not.toBeInViewport();
      expect(await content.evaluate((el) => el.scrollTop)).toBeGreaterThan(1000);

      await content.evaluate((el) => el.scrollTo(0, 0));
      await expect(firstRow).toBeInViewport();
      await noOverlap();

      // Tree/Raw and Expand/Collapse keep working after scrolling.
      await toolbar.getByRole("button", { name: "Raw" }).click();
      await expect(content.getByText(/"200-TENANTCODE"/)).toBeVisible();
      await toolbar.getByRole("button", { name: "Tree" }).click();
      await toolbar.getByRole("button", { name: "Collapse all" }).click();
      await expect(content.getByText('"UNAVAILABLE"')).toHaveCount(0);
      await toolbar.getByRole("button", { name: "Expand all" }).click();
      await expect(content.getByText('"UNAVAILABLE"').first()).toBeVisible();

      // Search JSON still narrows the tree without disturbing the toolbar.
      await toolbar.getByPlaceholder("Search JSON").fill("205-TENANTCODE");
      await expect(content.getByText('"205-TENANTCODE"').first()).toBeVisible();
      await noOverlap();
    });

    test("info-agents: allowlisted, sends only its own params, and renders the keyed positional records", async ({ page }) => {
      let sent: { endpoint?: string; params?: Record<string, string> } = {};
      await page.route("**/api/playground", (route) => {
        sent = route.request().postDataJSON();
        const record = { "0": "0", "1": "available", "2": "UNAVAILABLE", "10": "201-TENANTCODE", "11": "201-TENANTCODE" };
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            ok: true,
            upstream: {
              status: 200,
              latencyMs: 12,
              sizeBytes: 90,
              contentType: "application/json",
              headers: {},
              bodyText: JSON.stringify({ "201-TENANTCODE": record }),
              redactedCount: 0,
              fieldsOmitted: 0,
            },
          }),
        });
      });
      await goLiveOn(page, "proxy/info-agents");
      await desktopPane(page).getByLabel("queue", { exact: true }).fill("281");
      await desktopPane(page).getByRole("button", { name: "Send request" }).click();
      await expect(desktopPane(page).getByText(/status: 200/)).toBeVisible({ timeout: 3000 });
      await expect(desktopPane(page).getByText('"UNAVAILABLE"')).toBeVisible();
      expect(sent.endpoint).toBe("proxy/info-agents");
      expect(Object.keys(sent.params ?? {}).every((k) => ["tenant", "queue", "format"].includes(k))).toBe(true);
      expect(sent.params?.queue).toBe("281");
    });

    test("cdr-get: shows the raw userfield text, and explains an empty 200", async ({ page }) => {
      let body = "customer-note-e2e";
      await page.route("**/api/playground", (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            ok: true,
            upstream: {
              status: 200,
              latencyMs: 9,
              sizeBytes: body.length,
              contentType: "text/html; charset=UTF-8",
              headers: {},
              bodyText: body,
              redactedCount: 0,
              fieldsOmitted: 0,
            },
          }),
        }),
      );
      await goLiveOn(page, "proxy/cdr-get");
      // field is fixed to userfield: shown as a fixed parameter, never editable.
      await expect(desktopPane(page).getByLabel("field", { exact: true })).toHaveCount(0);
      await expect(desktopPane(page).getByLabel("format", { exact: true })).toHaveCount(0);
      await desktopPane(page).getByLabel("uniqueid", { exact: true }).fill("PBX-1701011773.4670");
      await desktopPane(page).getByRole("button", { name: "Send request" }).click();
      await expect(desktopPane(page).getByText("customer-note-e2e")).toBeVisible({ timeout: 3000 });
      await expect(desktopPane(page).getByText(/upstream returned an empty body/)).toHaveCount(0);

      body = "";
      await desktopPane(page).getByRole("button", { name: "Send request" }).click();
      await expect(desktopPane(page).getByText(/upstream returned an empty body/)).toBeVisible({ timeout: 3000 });
    });

    // Real route, no mock: both are rejected by validation before any
    // upstream fetch, so neither can reach the 1com host.
    test("the real route rejects a CDR field override and a non-allowlisted operation", async ({ request, baseURL }) => {
      const headers = { origin: baseURL!, "sec-fetch-site": "same-origin", "content-type": "application/json" };
      const override = await request.post("/api/playground", {
        headers,
        data: { endpoint: "proxy/cdr-get", params: { uniqueid: "PBX-1.2", field: "src" }, credential: "x" },
      });
      expect(override.status()).toBe(400);
      // Phase 10: a write (Proxy GET action) and a blocked call-content read.
      for (const endpoint of ["proxy/hangup", "proxy/info-recording"]) {
        const refused = await request.post("/api/playground", { headers, data: { endpoint, params: {}, credential: "x" } });
        expect(refused.status(), endpoint).toBe(403);
        expect((await refused.json()).error.code, endpoint).toBe("endpoint_not_allowed");
      }
      // A path value that is not one plain segment never leaves the portal.
      const traversal = await request.post("/api/playground", {
        headers,
        data: { endpoint: "openapi/queues-get", params: {}, pathParams: { qu_id: ".." }, credential: "x" },
      });
      expect(traversal.status()).toBe(400);
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
      await page.goto("./en/playground?endpoint=proxy/info-extensions");
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

  // Phase 6: Demo Mode fixtures for 4 of the 5 rescoped operations
  // (info-extensions, info-agents, info-dids, info-simplecdrs — QUEUELOGS is
  // blocked on real data, docs/SESSION_HANDOFF.md A-50). Demo is the
  // Playground's default mode; none of these tests switch to Live, and
  // demoProvider (executor.ts) never makes a network request — several
  // tests below assert that directly.
  test.describe("Demo Mode (Phase 6)", () => {
    // Each endpoint's own documented example values, plugged through
    // resolveDemoCase by hand: this is the scenario Send resolves to with no
    // field changed, i.e. the fixture set actually covers the endpoint's own
    // stated defaults.
    //
    // Stage 7 remediation discovery (finding 1's format=json fix):
    // info-extensions/-agents/-dids' shared `format` parameter got a
    // documented `example: "json"` (previously undocumented/unset), which
    // the Playground now pre-fills on load. That flips their own default
    // resolution from the "plain" fixture case to the "JSON" one — the
    // labels below were still "(plain)" and this loop's old assertion
    // (`getByText(label).last()`) didn't catch it: with the default no
    // longer matching "plain", the label text appears only once (the
    // unclicked chip button), so `.last()` on a single match trivially
    // passed without checking the *response* named that scenario at all.
    // Fixed here two ways: the labels now say what the default actually
    // resolves to, and the assertion is scoped to the response's own
    // "Scenario: <label>" line (`<p>`, response-viewer.tsx) instead of any
    // occurrence of the label text.
    const defaultResolves: { endpoint: string; label: string }[] = [
      { endpoint: "proxy/info-extensions", label: "Extension list (JSON)" },
      { endpoint: "proxy/info-agents", label: "Queue agents (JSON)" },
      { endpoint: "proxy/info-dids", label: "DID list (JSON)" },
      // info-simplecdrs and info-queuelogs went through the same format=json
      // fix but never had a "plain" default to begin with (info-simplecdrs's
      // default/plain shape is undocumented, A-54; info-queuelogs never
      // offered one at all) — their defaults now match their richest JSON
      // case for the same reason. This *replaces* those two endpoints'
      // former dedicated "unset-format default is Not simulated" tests,
      // which no longer describe reachable behavior (see the superseded
      // notes further below for why).
      { endpoint: "proxy/info-simplecdrs", label: "Calls, unfiltered (JSON)" },
      { endpoint: "proxy/info-queuelogs", label: "Abandoned call (JSON)" },
    ];

    for (const { endpoint, label } of defaultResolves) {
      test(`${endpoint}: default field values resolve a real Demo scenario, not Not simulated`, async ({ page }) => {
        await page.goto(`./en/playground?endpoint=${endpoint}`);
        await desktopPane(page).getByRole("button", { name: "Send request" }).click();
        await expect(desktopPane(page).getByText(/status: 200/)).toBeVisible({ timeout: 3000 });
        // Scoped to the response's own "Scenario: <label>" line (a single
        // <p>, response-viewer.tsx), not just any element containing the
        // label text — the label also names the (always-rendered, unclicked)
        // scenario chip button, which must not satisfy this assertion.
        const scenarioLine = desktopPane(page).locator("p", { hasText: "Scenario:" });
        await expect(scenarioLine).toBeVisible();
        await expect(scenarioLine).toContainText(label);
        await expect(desktopPane(page).getByText("Not simulated")).toHaveCount(0);
      });
    }

    // Superseded note (Stage 7 remediation): this endpoint used to have its
    // own "the unset-format default is Not simulated" test, exercising the
    // one input combination (format left at its pre-Stage-7 unset state)
    // that no fixture case covered. Stage 7 finding 1 gave `format` a
    // documented example ("json"), which the Playground now pre-fills on
    // load — so that combination can no longer occur, and every reachable
    // combination (phone: empty/matched/anything else, format: json/csv;
    // `format`'s own <select> only offers those two values — its blank
    // placeholder option is `disabled` and cannot be chosen through the
    // UI) is covered by a fixture. "Not simulated" is therefore not
    // reachable for this endpoint via the real Playground UI at all
    // (unlike info-extstate's Stage 5 bug, this is a real behavior change
    // from the Stage 7 fix, not a bug — the default now matches
    // `defaultResolves` above instead). This test now covers what's still
    // meaningful: scenario chips still switch between the endpoint's
    // distinct fixture cases (json/csv, matched/unmatched).
    test("info-simplecdrs: scenario chips switch between the JSON and CSV fixture cases", async ({ page }) => {
      await page.goto("./en/playground?endpoint=proxy/info-simplecdrs");

      await desktopPane(page).getByRole("button", { name: "Calls, phone match (JSON)" }).click();
      await expect(desktopPane(page).getByLabel("phone", { exact: true })).toHaveValue("5550101001");
      await desktopPane(page).getByRole("button", { name: "Send request" }).click();
      await expect(desktopPane(page).getByText(/status: 200/)).toBeVisible({ timeout: 3000 });
      await expect(desktopPane(page).getByText("Calls, phone match (JSON)").last()).toBeVisible();
      // "Demo Caller One" also appears twice in the tree (sc_calleridname
      // plus its positional-key duplicate, A-49) — `.first()` is enough to
      // confirm the matched record rendered.
      await expect(desktopPane(page).getByTestId("json-content").getByText("Demo Caller One").first()).toBeVisible();
      await expect(desktopPane(page).getByTestId("json-content").getByText("Demo Caller Two")).toHaveCount(0);

      await desktopPane(page).getByRole("button", { name: "Calls, no match (JSON, empty)" }).click();
      await desktopPane(page).getByRole("button", { name: "Send request" }).click();
      await expect(desktopPane(page).getByText(/status: 200/)).toBeVisible({ timeout: 3000 });
      await expect(desktopPane(page).getByText(/size: 0 B/)).toBeVisible();

      await desktopPane(page).getByRole("button", { name: "Calls, unfiltered (CSV)" }).click();
      await expect(desktopPane(page).getByLabel("format", { exact: true })).toHaveValue("csv");
      await desktopPane(page).getByRole("button", { name: "Send request" }).click();
      await expect(desktopPane(page).getByText(/status: 200/)).toBeVisible({ timeout: 3000 });
      await expect(desktopPane(page).getByText("Calls, unfiltered (CSV)").last()).toBeVisible();
      await expect(desktopPane(page).getByText(/sc_te_id,tenantcode/)).toBeVisible();
    });

    test("a scenario chip fills the endpoint's own query fields, then Send reflects that exact scenario", async ({
      page,
    }) => {
      await page.goto("./en/playground?endpoint=proxy/info-agents");
      await desktopPane(page).getByRole("button", { name: "Unknown queue (JSON null)" }).click();
      await expect(desktopPane(page).getByLabel("queue", { exact: true })).toHaveValue("999999");
      await expect(desktopPane(page).getByLabel("format", { exact: true })).toHaveValue("json");
      await desktopPane(page).getByRole("button", { name: "Send request" }).click();
      await expect(desktopPane(page).getByText(/status: 200/)).toBeVisible({ timeout: 3000 });
      await expect(desktopPane(page).getByText("Unknown queue (JSON null)").last()).toBeVisible();
      // Scoped to the JSON tree itself: "null" also appears as a substring of
      // the chip button and scenario-line labels above.
      await expect(desktopPane(page).getByTestId("json-content").getByText("null")).toBeVisible();
    });

    test("Simulate error is hidden once an endpoint has fixtures, unlike the fixture-less Sample API", async ({
      page,
    }) => {
      await page.goto("./en/playground?endpoint=proxy/info-extensions");
      await expect(desktopPane(page).getByText("Simulate error response")).toHaveCount(0);
      await page.goto("./en/playground?endpoint=sample/list-call-records");
      await expect(desktopPane(page).getByText("Simulate error response")).toBeVisible();
      // A real API endpoint without fixtures has no error example to simulate (8B).
      await page.goto("./en/playground?endpoint=openapi/cdrs-list");
      await expect(desktopPane(page).getByText("Simulate error response")).toHaveCount(0);
    });

    test("Demo mode makes no network request, across a scenario-chip + Send flow", async ({ page }) => {
      let called = false;
      await page.route("**/api/playground", (route) => {
        called = true;
        return route.abort();
      });
      await page.goto("./en/playground?endpoint=proxy/info-dids");
      await desktopPane(page).getByRole("button", { name: "CSV (empty)" }).click();
      await desktopPane(page).getByRole("button", { name: "Send request" }).click();
      await expect(desktopPane(page).getByText(/status: 200/)).toBeVisible({ timeout: 3000 });
      expect(called).toBe(false);
    });

    test("the Request tab is available for Demo too, explicitly marked not sent", async ({ page }) => {
      await page.goto("./en/playground?endpoint=proxy/info-extensions");
      await desktopPane(page).getByRole("button", { name: "Send request" }).click();
      await expect(desktopPane(page).getByText(/status: 200/)).toBeVisible({ timeout: 3000 });
      await desktopPane(page).getByRole("tab", { name: "Request" }).click();
      await expect(
        // `.last()`: the request-pane Request preview (Phase 8C) says the same, earlier in the DOM.
        desktopPane(page).getByText("Not sent — Demo. This shows what the equivalent Live request would look like.").last(),
      ).toBeVisible();
      // `.first()` reaches the endpoint-path <code> element; the same substring
      // also appears in the full-URL and curl-command lines below it.
      await expect(
        desktopPane(page).getByText(/reqtype=INFO&info=EXTENSIONS/).first(),
      ).toBeVisible();
    });

    // Stage 7 remediation: label updated from "(plain)" to "(JSON)" — see
    // the defaultResolves comment above for why info-agents' default
    // resolution changed. `.first()` here relies on the response's own
    // "Scenario: <label>" line matching before the (separately-mounted,
    // CSS-hidden-at-this-viewport) desktop chip button does; that only
    // holds when the label text genuinely matches what the response
    // resolved to, which is what broke silently before this fix.
    test("mobile: a Demo scenario resolves through the step flow", async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto("./en/playground?endpoint=proxy/info-agents");
      await page.getByRole("button", { name: "Send request" }).first().click();
      await page.getByRole("tab", { name: "Response" }).click();
      await expect(page.getByText(/status: 200/).first()).toBeVisible({ timeout: 3000 });
      await expect(page.getByText("Queue agents (JSON)").first()).toBeVisible();
    });

    // Superseded note (Stage 7 remediation): info-queuelogs's `format` param
    // also gained a documented example ("json"), same as info-simplecdrs
    // above — its default Send now resolves "Abandoned call (JSON)"
    // directly (covered by the `defaultResolves` loop above), so the old
    // "default is Not simulated" premise no longer holds. This test now
    // covers what's still meaningful: the resolved default response's own
    // content (the observed record's disposition field).
    test("info-queuelogs: the default-resolved abandoned-call scenario has the observed record's content", async ({
      page,
    }) => {
      await page.goto("./en/playground?endpoint=proxy/info-queuelogs");
      await desktopPane(page).getByRole("button", { name: "Send request" }).click();
      await expect(desktopPane(page).getByText(/status: 200/)).toBeVisible({ timeout: 3000 });
      await expect(desktopPane(page).getByText("Abandoned call (JSON)").last()).toBeVisible();
      await expect(desktopPane(page).getByTestId("json-content").getByText('"ABANDONED"').first()).toBeVisible();
    });

    test("info-queuelogs: the no-data JSON chip reproduces the single-byte ] body", async ({ page }) => {
      await page.goto("./en/playground?endpoint=proxy/info-queuelogs");
      await desktopPane(page).getByRole("button", { name: "No data (JSON)" }).click();
      await desktopPane(page).getByRole("button", { name: "Send request" }).click();
      await expect(desktopPane(page).getByText(/status: 200/)).toBeVisible({ timeout: 3000 });
      await expect(desktopPane(page).getByText(/size: 1 B/)).toBeVisible();
      await expect(desktopPane(page).locator("pre").filter({ hasText: /^\]$/ })).toBeVisible();
    });
  });

  // Phase 7: write operations, form/multipart bodies, binary responses.
  test.describe("Proxy rollout (Phase 7)", () => {
    test("a write operation is reference-only: warning callout, no Try link, vendor response sample", async ({ page }) => {
      await page.goto("./en/reference/proxy/dial");
      await expect(page.getByRole("heading", { name: "Place a call" })).toBeVisible();
      await expect(page.getByText("Changes state — reference only")).toBeVisible();
      await expect(page.getByRole("link", { name: "Try in Playground" })).toHaveCount(0);
      const panel = await requestPanel(page);
      await expect(panel.getByTestId("reference-only")).toBeVisible();
      await expect(panel.getByText("Vendor sample")).toBeVisible();
      await expect(panel.getByText("Success|Originate successfully queued|15a4cfe6429054|")).toBeVisible();
    });

    test("a write operation never sends from the Playground, in Demo or Live", async ({ page }) => {
      await page.goto("./en/playground?endpoint=proxy/dial");
      const send = desktopPane(page).getByRole("button", { name: "Send request" });
      await expect(send).toBeDisabled();
      await expect(desktopPane(page).getByTestId("write-only-note")).toBeVisible();
      await page.getByRole("button", { name: "Switch to Live" }).click();
      await page.getByRole("button", { name: "Switch mode" }).click();
      await expect(send).toBeDisabled();
      await expect(desktopPane(page).getByTestId("write-only-note")).toBeVisible();
    });

    test("a form-encoded write documents its values body and a form-encoded POST sample", async ({ page }) => {
      await page.goto("./en/reference/proxy/phonebook-add");
      await expect(page.getByText(/with one field, values, whose value is the object below encoded as JSON/)).toBeVisible();
      const panel = await requestPanel(page);
      await expect(panel.getByText(/--url-query "reqtype=PHONEBOOK"/)).toBeVisible();
      await expect(panel.getByText(/--data-urlencode 'values=/)).toBeVisible();
    });

    test("administrative content is not reachable: removed pages 404 and are absent from nav and search (8E)", async ({ page }) => {
      for (const path of [
        "./en/reference/openapi/tenants-list",
        "./en/reference/openapi/auth-token-create",
        "./en/reference/proxy/managedb-custom-add",
        "./en/guides/managedb-writes",
      ]) {
        const res = await page.goto(path);
        expect(res?.status(), path).toBe(404);
      }
      await page.goto("./en/reference/openapi");
      // "Tenant Variable" stays (a tenant-scoped resource); only the global-key-only ones are gone.
      await expect(page.locator("aside").getByText("Tenant", { exact: true })).toHaveCount(0);
      await expect(page.locator("aside").getByRole("link", { name: /^List tenants$/ })).toHaveCount(0);
      await page.goto("./en/reference/proxy");
      await expect(page.locator("aside")).not.toContainText("MANAGEDB");
      await expect(page.locator("body")).not.toContainText(/global API Key|Admin key/i);
    });

    test("a binary response says so instead of 'No response body'", async ({ page }) => {
      await page.goto("./en/reference/proxy/info-recording");
      const panel = await requestPanel(page);
      await expect(panel.getByText("Binary body (for example audio). Not shown here.")).toBeVisible();
      await expect(panel.getByText("--output response.bin")).toBeVisible();
    });
  });

  // Phase 8 Stage 5: cross-API switching, a path-parameter endpoint, write
  // blocking, and Demo fixtures, for the MiRTA OpenAPI rollout.
  test.describe("Open API rollout (Phase 8)", () => {
    // The desktop sidebar's own API select only renders past the `xl`
    // breakpoint (sidebar-nav.tsx); a second copy lives in the mobile nav
    // drawer (site-header.tsx, hidden until opened) — set the viewport
    // explicitly so this test exercises the always-visible one regardless
    // of which project (desktop/mobile) runs it. WebKit-only: this
    // React-controlled <select>'s onChange (and hence the navigation) never
    // fires from Playwright's WebKit `selectOption`, confirmed directly
    // against a plain (non-mobile-emulated) WebKit instance and unrelated
    // to this endpoint's content — the identical call works on Chromium.
    // Real Safari/iOS users interacting with the native picker aren't
    // affected; this is a Playwright/WebKit automation gap.
    test("the sidebar API select switches from Proxy to Open API", async ({ page, browserName }) => {
      test.skip(browserName === "webkit", "Playwright/WebKit doesn't fire onChange for a React-controlled <select> via selectOption — see comment above.");
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto("./en/reference/proxy");
      await expect(page.getByRole("heading", { name: "Proxy" }).first()).toBeVisible();
      await page.locator("aside").getByLabel("API").selectOption("openapi");
      await expect(page).toHaveURL(/\/en\/reference\/openapi$/);
      await expect(page.getByRole("heading", { name: "1com Open API" }).first()).toBeVisible();
    });

    test("side menus start collapsed except the active endpoint's category", async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });

      await page.goto("./en/reference/openapi");
      const groups = page.locator("aside").first().locator("details");
      expect(await groups.count()).toBeGreaterThan(1);
      await expect(page.locator("aside").first().locator("details[open]")).toHaveCount(0);

      await page.goto("./en/reference/openapi/cdrs-list");
      await expect(page.locator("aside").first().locator("details[open]")).toHaveCount(1);
      await expect(
        page.locator("aside").first().locator("details[open]").getByRole("link", { name: /List CDRs/ }),
      ).toBeVisible();

      await page.goto("./en/playground?endpoint=openapi/cdrs-list");
      const picker = desktopPane(page).locator("nav details");
      expect(await picker.count()).toBeGreaterThan(1);
      await expect(desktopPane(page).locator("nav details[open]")).toHaveCount(1);

      // Filtering opens every matching category; clearing returns to the default.
      const filter = desktopPane(page).getByRole("searchbox");
      // fill() before hydration is lost; retry until the filter takes effect.
      // Clear first: refilling an identical DOM value fires no React onChange.
      await expect(async () => {
        await filter.fill("");
        await filter.fill("cdr");
        await expect(desktopPane(page).locator("nav details:not([open])")).toHaveCount(0, { timeout: 500 });
      }).toPass({ timeout: 10_000 });
      await filter.fill("");
      await expect(desktopPane(page).locator("nav details[open]")).toHaveCount(1);
    });

    test("side menus: Expand all / Collapse all, curated order, Provisioning and Setting hidden", async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      const expectedFirst = ["Dial", "CDR", "Extension", "DID", "Queue", "Hunt List", "Media File"];

      for (const [url, menu] of [
        ["./en/reference/openapi/cdrs-list", () => page.locator("aside").first()],
        ["./en/playground?endpoint=openapi/cdrs-list", () => desktopPane(page).locator("nav")],
      ] as const) {
        await page.goto(url);
        const scope = menu();
        const summaries = scope.locator("details > summary");
        await expect(summaries.first()).toHaveText("Dial");
        const titles = (await summaries.allTextContents()).map((s) => s.trim());
        expect(titles.slice(0, 7)).toEqual(expectedFirst);
        expect(titles).not.toContain("Provisioning Phone");
        expect(titles).not.toContain("Setting");

        // Clicks before hydration are lost; retry until the groups respond.
        await expect(async () => {
          await scope.getByRole("button", { name: "Expand all" }).click();
          await expect(scope.locator("details:not([open])")).toHaveCount(0, { timeout: 500 });
        }).toPass({ timeout: 10_000 });
        await scope.getByRole("button", { name: "Collapse all" }).click();
        await expect(scope.locator("details[open]")).toHaveCount(0);
        // A group stays under the user's control after a bulk action.
        await summaries.nth(1).click();
        await expect(scope.locator("details[open]")).toHaveCount(1);
      }

      // Hidden from the menu only: the page itself still exists.
      const res = await page.goto("./en/reference/openapi/provisioningphones-list");
      expect(res?.status()).toBe(200);
    });

    test("menu groups: related categories under one entry, as one flat list, on every surface (issue #1)", async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      const cdrGroup = (scope: import("@playwright/test").Locator) =>
        scope.locator("details").filter({ has: page.locator("summary", { hasText: /^CDR$/ }) });
      const linkNames = async (group: import("@playwright/test").Locator, role: "link" | "button") =>
        (await group.locator("li").getByRole(role).allTextContents()).map((t) => t.replace(/^GET/, "").trim());

      // Sidebar: one CDR entry, open on a CDR page; Simple CDR's operation then CDR's, no sub-headings.
      await page.goto("./en/reference/openapi/cdrs-list");
      const aside = page.locator("aside").first();
      const summaries = (await aside.locator("details > summary").allTextContents()).map((t) => t.trim());
      for (const merged of ["Simple CDR", "Campaign Number", "Phone Book Entry", "AI Logs"]) expect(summaries).not.toContain(merged);
      for (const group of ["CDR", "Campaign", "Phone Book", "AI Analysis"]) expect(summaries).toContain(group);
      const cdr = cdrGroup(aside);
      await expect(cdr).toHaveAttribute("open", "");
      await expect(cdr.locator("ul")).toHaveCount(1);
      await expect(cdr.locator("p")).toHaveCount(0);
      expect(await linkNames(cdr, "link")).toEqual(["List simple CDRs", "List CDRs"]);

      // Proxy API groups; COUNTCALLS stays alone.
      await page.goto("./en/reference/proxy");
      const proxy = (await aside.locator("details > summary").allTextContents()).map((t) => t.trim());
      for (const group of ["CHANNELS", "PEERS", "QUEUE", "FLOWS", "COUNTCALLS"]) expect(proxy).toContain(group);
      for (const merged of ["CHANNEL", "COUNTCHANNELS", "COUNTPEERS", "QUEUERESET", "SETFLOW"]) expect(proxy).not.toContain(merged);

      // Overview: one CDR section listing both operations, no sub-headings; hidden-from-menu categories still listed.
      await page.goto("./en/reference/openapi");
      const main = page.locator("main");
      const cdrSection = main.locator("section").filter({ has: page.getByRole("heading", { level: 2, name: "CDR", exact: true }) });
      await expect(cdrSection.locator("h3")).toHaveCount(0);
      await expect(cdrSection.getByRole("link")).toHaveCount(2);
      await expect(main.getByRole("heading", { name: "Simple CDR" })).toHaveCount(0);
      await expect(main.getByRole("heading", { level: 2, name: "Provisioning Phone" })).toBeVisible();

      // Playground picker: same flat group; the filter narrows it to the matching operation.
      await page.goto("./en/playground?endpoint=openapi/cdrs-list");
      const nav = desktopPane(page).locator("nav");
      expect(await linkNames(cdrGroup(nav), "button")).toEqual(["List simple CDRs", "List CDRs"]);
      const filter = desktopPane(page).getByRole("searchbox");
      await expect(async () => {
        await filter.fill("");
        await filter.fill("simple cdr");
        await expect(nav.locator("details")).toHaveCount(1, { timeout: 500 });
      }).toPass({ timeout: 10_000 });
      expect(await linkNames(cdrGroup(nav), "button")).toEqual(["List simple CDRs"]);

      // Mobile drawer: same flat group.
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto("./en/reference/openapi/cdrs-list");
      const dialog = page.getByRole("dialog", { name: "Main" });
      await expect(async () => {
        await page.getByRole("button", { name: "Open navigation" }).click();
        await expect(dialog).toBeVisible({ timeout: 500 });
      }).toPass({ timeout: 10_000 });
      expect(await linkNames(cdrGroup(dialog), "link")).toEqual(["List simple CDRs", "List CDRs"]);
    });

    test("CDR Reference shows the documented response fields and the official named examples (8A)", async ({ page }) => {
      await page.goto("./en/reference/openapi/cdrs-list");
      await expect(page.getByRole("heading", { name: "List CDRs" })).toBeVisible();
      // Response Fields table from the official page: 30 fields, types undocumented.
      await expect(page.locator('[id^="response-200"]')).toHaveCount(30);
      await expect(page.locator('[id="response-200.pincode"]')).toBeAttached();
      // The panel says the example is missing, not that the body is empty.
      await expect(page.getByText("No example body documented.", { exact: false }).first()).toBeAttached();
      // Named examples, rendered with the portal base URL and the header credential.
      const examples = page.getByTestId("endpoint-examples");
      // 10 official examples; the one made with a global key is not shown (Phase 8E).
      await expect(examples.locator(":scope > li")).toHaveCount(9);
      const byLinkedId = examples.locator("details").filter({ hasText: "CDR by Linked ID" });
      await byLinkedId.locator("summary").click();
      const code = byLinkedId.locator("pre").first();
      await expect(code).toContainText("pbx6webserver.1com.co.il/pbx/openapi.php/cdrs?tenant=TESTTENANT&linkedid=");
      await expect(code).toContainText("X-API-Key: $OPENAPI_API_KEY");
      await expect(code).not.toContainText("CANISTRACCI");
      await expect(examples.locator("details").filter({ hasText: "CDR Global Tenant Wildcard" })).toHaveCount(0);
    });

    test("a path-parameter endpoint documents its example placeholder and prefills it in the Playground", async ({ page }) => {
      await page.goto("./en/reference/openapi/extensions-get");
      await expect(page.getByRole("heading", { name: "Get extension" })).toBeVisible();
      const panel = await requestPanel(page);
      // The example value the code sample substitutes into the path.
      await expect(panel.getByText(/\/extensions\/OBJECT_ID/)).toBeVisible();
      await panel.getByRole("link", { name: "Try in Playground" }).click();
      await expect(page).toHaveURL(/endpoint=openapi\/extensions-get/);
      await expect(desktopPane(page).getByLabel("ex_id")).toHaveValue("OBJECT_ID");
    });

    test("a write operation is reference-only: warning callout, no Try link, no Send", async ({ page }) => {
      await page.goto("./en/reference/openapi/dial");
      await expect(page.getByRole("heading", { name: "Originate a call" })).toBeVisible();
      await expect(page.getByText("Changes state — reference only")).toBeVisible();
      await expect(page.getByRole("link", { name: "Try in Playground" })).toHaveCount(0);
      const panel = await requestPanel(page);
      await expect(panel.getByTestId("reference-only")).toBeVisible();

      await page.goto("./en/playground?endpoint=openapi/dial");
      await expect(desktopPane(page).getByRole("button", { name: "Send request" })).toBeDisabled();
      await expect(desktopPane(page).getByTestId("write-only-note")).toBeVisible();
    });

    const demoFixtures: { endpoint: string; label: string }[] = [
      { endpoint: "openapi/extensions-state-get", label: "Registered, active channel" },
      { endpoint: "openapi/queues-list", label: "Queues found" },
      { endpoint: "openapi/queues-get", label: "Queue found" },
      { endpoint: "openapi/aianalysis-get", label: "Analysis found (JSON)" },
    ];

    for (const { endpoint, label } of demoFixtures) {
      test(`${endpoint}: default field values resolve its documented-example Demo scenario`, async ({ page }) => {
        await page.goto(`./en/playground?endpoint=${endpoint}`);
        await desktopPane(page).getByRole("button", { name: "Send request" }).click();
        await expect(desktopPane(page).getByText(/status: 200/)).toBeVisible({ timeout: 3000 });
        const scenarioLine = desktopPane(page).locator("p", { hasText: "Scenario:" });
        await expect(scenarioLine).toBeVisible();
        await expect(scenarioLine).toContainText(label);
        await expect(desktopPane(page).getByText("Not simulated")).toHaveCount(0);
      });
    }

    test("ailogs-list: dropped from Demo (404 on the test PBX, 8B) shows Demo data not available, not a guess", async ({ page }) => {
      await page.goto("./en/playground?endpoint=openapi/ailogs-list");
      await desktopPane(page).getByRole("button", { name: "Send request" }).click();
      await expect(desktopPane(page).getByText("Demo data not available yet")).toBeVisible({ timeout: 3000 });
    });

    const documentedChips: { endpoint: string; chip: string; expect: RegExp }[] = [
      { endpoint: "openapi/extensions-state-get", chip: "Not registered", expect: /Extension not registered/ },
      { endpoint: "openapi/aianalysis-get", chip: "One of two unique IDs unknown", expect: /1700000000\.42/ },
      { endpoint: "openapi/aianalysis-get", chip: "Invalid API Key", expect: /invalid_api_key/ },
      { endpoint: "openapi/queues-get", chip: "Queue found", expect: /allowed_members/ },
    ];

    for (const { endpoint, chip, expect: body } of documentedChips) {
      test(`${endpoint}: the "${chip}" chip resolves its documented case, with no network request (8B)`, async ({ page }) => {
        let called = false;
        await page.route("**/api/playground", (route) => {
          called = true;
          return route.abort();
        });
        await page.goto(`./en/playground?endpoint=${endpoint}`);
        await desktopPane(page).getByRole("button", { name: chip }).click();
        await desktopPane(page).getByRole("button", { name: "Send request" }).click();
        await expect(desktopPane(page).locator("p", { hasText: "Scenario:" })).toContainText(chip, { timeout: 3000 });
        await expect(desktopPane(page).getByTestId("json-content")).toContainText(body);
        expect(called).toBe(false);
      });
    }

    test('openapi/simplecdrs-list: the "No matching calls" chip resolves an empty array, with no network request (8B Stage 4)', async ({ page }) => {
      let called = false;
      await page.route("**/api/playground", (route) => {
        called = true;
        return route.abort();
      });
      await page.goto("./en/playground?endpoint=openapi/simplecdrs-list");
      await desktopPane(page).getByRole("button", { name: "No matching calls" }).click();
      await desktopPane(page).getByRole("button", { name: "Send request" }).click();
      await expect(desktopPane(page).getByText(/status: 200/)).toBeVisible({ timeout: 3000 });
      await expect(desktopPane(page).locator("p", { hasText: "Scenario:" })).toContainText("No matching calls");
      expect(called).toBe(false);
    });

    test("OpenAPI Request tab substitutes path values and masks the X-API-Key header (8B)", async ({ page }) => {
      await page.goto("./en/playground?endpoint=openapi/extensions-state-get");
      await desktopPane(page).getByRole("button", { name: "Send request" }).click();
      await expect(desktopPane(page).getByText(/status: 200/)).toBeVisible({ timeout: 3000 });
      await desktopPane(page).getByRole("tab", { name: "Request" }).click();
      // `.last()`: the request-pane Request preview (Phase 8C) renders the same lines earlier in the DOM.
      await expect(desktopPane(page).getByText("X-API-Key: ••••").last()).toBeVisible();
      await expect(desktopPane(page).getByText(/^curl ".*" -H "X-API-Key: \$OPENAPI_API_KEY"$/).last()).toBeVisible();
    });

    test("cdrs-list: a GET with no fixture shows Demo data not available, never a guess", async ({ page }) => {
      await page.goto("./en/playground?endpoint=openapi/cdrs-list");
      await desktopPane(page).getByRole("button", { name: "Send request" }).click();
      await expect(desktopPane(page).getByText("Demo data not available yet")).toBeVisible({ timeout: 3000 });
    });

    test("a write shows its request preview with the typed body, never sends, and masks secret fields (8C)", async ({ page }) => {
      const sent: string[] = [];
      page.on("request", (r) => {
        if (r.url().includes("/api/playground")) sent.push(r.url());
      });
      await page.goto("./en/playground?endpoint=openapi/extensions-create");
      const pane = desktopPane(page);
      await expect(pane.getByTestId("write-only-note")).toBeVisible();
      await expect(pane.getByRole("button", { name: "Send request" })).toBeDisabled();
      await pane.getByTestId("request-preview").locator("summary").click();
      const body = pane.getByTestId("request-preview").getByTestId("request-body");
      await expect(body).toContainText('"number": "100"');
      await pane.getByRole("textbox", { name: /^name( \*)?$/ }).fill("Typed Name");
      await expect(body).toContainText('"name": "Typed Name"');
      await pane.getByRole("textbox", { name: /^password( \*)?$/ }).fill("hunter2-REAL");
      const preview = pane.getByTestId("request-preview");
      await expect(body).toContainText("<REDACTED>");
      await expect(preview).not.toContainText("hunter2-REAL");
      await expect(preview).not.toContainText("SYNTHETIC_SECRET");
      await expect(preview).toContainText("Content-Type: application/json");
      await expect(preview).toContainText("-X POST");
      expect(sent).toEqual([]);
    });

    test("the operation header shows kind and auth, and no key scope (8C)", async ({ page }) => {
      await page.goto("./en/playground?endpoint=openapi/cdrs-list");
      const header = desktopPane(page).getByTestId("operation-header");
      await expect(header.getByTestId("op-kind")).toHaveText("Read-only");
      await expect(header).toContainText("X-API-Key header");
      await expect(header).not.toContainText("Key scope");
      await page.goto("./en/playground?endpoint=openapi/extensions-create");
      await expect(desktopPane(page).getByTestId("operation-header").getByTestId("op-kind")).toHaveText("Changes state");
    });

    test("fields show their documented type and description, and JSON fields are text areas (8C)", async ({ page }) => {
      await page.goto("./en/playground?endpoint=openapi/extensions-create");
      const pane = desktopPane(page);
      await expect(pane.getByText("Extension number.", { exact: false }).first()).toBeVisible();
      const aors = pane.getByRole("textbox", { name: /^ps_aors/ });
      expect(await aors.evaluate((el) => el.tagName)).toBe("TEXTAREA");
      await expect(aors).toHaveValue('{"max_contacts":1}');
    });

    test("the Playground API select moves to another API's first endpoint (8C)", async ({ page, browserName }) => {
      test.skip(browserName === "webkit", "Playwright/WebKit doesn't fire onChange for a React-controlled <select> via selectOption.");
      await page.goto("./en/playground?endpoint=proxy/info-extensions");
      await desktopPane(page).getByLabel("API", { exact: true }).selectOption("openapi");
      await expect(page).toHaveURL(/endpoint=openapi\//);
      await expect(desktopPane(page).getByTestId("operation-header")).toContainText("X-API-Key header");
    });

    test("an unknown ?endpoint= says so instead of silently showing another operation (8C)", async ({ page }) => {
      await page.goto("./en/playground?endpoint=openapi/does-not-exist");
      await expect(page.getByTestId("endpoint-not-found")).toContainText("openapi/does-not-exist");
      await page.goto("./en/playground");
      await expect(page.getByTestId("endpoint-not-found")).toHaveCount(0);
    });

    test("Live on a blocked OpenAPI operation is explicitly not enabled: no key field, nothing sendable (8C, Phase 10)", async ({ page }) => {
      const sent: string[] = [];
      page.on("request", (r) => {
        if (r.url().includes("/api/playground")) sent.push(r.url());
      });
      // extensions-list is Live since Phase 10; AI Analysis stays blocked (call content).
      await page.goto("./en/playground?endpoint=openapi/aianalysis-get");
      await page.getByRole("button", { name: "Switch to Live" }).click();
      await page.getByRole("button", { name: "Switch mode" }).click();
      const pane = desktopPane(page);
      await expect(page.getByText("Live execution is not enabled for this operation. Nothing is sent.")).toBeVisible();
      await expect(pane.getByLabel("API key")).toHaveCount(0);
      await expect(pane.getByRole("button", { name: "Send request" })).toBeDisabled();
      await expect(pane.getByText(/default-deny/)).toBeVisible();
      expect(sent).toEqual([]);
    });

    test("narrow mobile: select a resource, enter a parameter, preview the request, run Demo, and a write stays unsendable (8C)", async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      const sent: string[] = [];
      page.on("request", (r) => {
        if (r.url().includes("/api/playground")) sent.push(r.url());
      });
      const consoleErrors: string[] = [];
      page.on("console", (m) => {
        if (m.type() === "error") consoleErrors.push(m.text());
      });
      // The stepper (md:hidden) is the only pane rendered at this width; the
      // desktop grid stays in the DOM but hidden, so scope to the stepper.
      const mobile = page.locator(".md\\:hidden");
      const step = (name: string) => mobile.getByRole("tab", { name, exact: true });

      await page.goto("./en/playground?endpoint=openapi/extensions-list");
      await expect(mobile.getByTestId("operation-header")).toContainText("X-API-Key header");
      await mobile.getByTestId("request-preview").locator("summary").click();
      // A fill sent before React hydrates is overwritten by the controlled
      // value (same race as the search-palette and nav-drawer tests above):
      // retry until the preview, which is derived from state, shows it.
      await expect(async () => {
        await mobile.getByRole("textbox", { name: /^tenant/ }).fill("MOBILETENANT");
        await expect(mobile.getByTestId("request-preview")).toContainText("tenant=MOBILETENANT", { timeout: 500 });
      }).toPass({ timeout: 10_000 });

      await mobile.getByRole("button", { name: "Send request" }).click();
      await step("Response").click();
      await expect(mobile.getByText(/source: DEMO/)).toBeVisible({ timeout: 3000 });
      await expect(mobile.getByText(/status: 401|status: 200/)).toBeVisible();

      // Resource selection through the Endpoint step, onto a write.
      await step("Endpoint").click();
      await mobile.getByPlaceholder("Filter endpoints").fill("Create extension");
      await mobile.getByRole("button", { name: /Create extension/ }).click();
      await step("Request").click();
      await expect(mobile.getByTestId("op-kind")).toHaveText("Changes state");
      await expect(mobile.getByTestId("write-only-note")).toBeVisible();
      await expect(mobile.getByRole("button", { name: "Send request" })).toBeDisabled();

      expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)).toBe(false);
      expect(sent).toEqual([]);
      expect(consoleErrors).toEqual([]);
    });

    test("date-time pickers compose the exact documented string and send it in the request (8E)", async ({ page }) => {
      await page.goto("./en/playground?endpoint=openapi/simplecdrs-list");
      const pane = desktopPane(page);
      const start = pane.getByTestId("date-field-start");
      const end = pane.getByTestId("date-field-end");
      // Pre-filled documented example parses into the pickers.
      await expect(start.locator('input[type="date"]')).toHaveValue("2026-01-01");
      await expect(start.locator('input[type="time"]')).toHaveValue("00:00:00");
      await expect(end.locator('input[type="time"]')).toHaveValue("23:59:59");

      await pane.getByTestId("request-preview").locator("summary").click();
      const preview = pane.getByTestId("request-preview");
      // Pick a date and a time; the string is YYYY-MM-DD HH:MM:SS (space encoded in the URL), not ISO.
      await start.locator('input[type="date"]').fill("2026-03-05");
      await start.locator('input[type="time"]').fill("09:15:30");
      await end.locator('input[type="date"]').fill("2026-03-06");
      await expect(preview).toContainText("start=2026-03-05+09%3A15%3A30");
      await expect(preview).toContainText("end=2026-03-06+23%3A59%3A59"); // documented default end time
      await expect(preview).not.toContainText("T09:15");

      // Clear empties the value; the request then carries no start.
      await start.getByRole("button", { name: "Clear" }).click();
      await expect(start.locator('input[type="date"]')).toHaveValue("");
      await expect(start.locator('input[type="time"]')).toBeDisabled();
      await expect(preview).not.toContainText("start=");

      // Demo still runs: the date value never changes which scenario resolves.
      await pane.getByRole("button", { name: "Send request" }).click();
      await expect(pane.getByText(/status: 200/)).toBeVisible({ timeout: 3000 });
    });

    test("date-only fields use a date picker and send YYYY-MM-DD (8E)", async ({ page }) => {
      await page.goto("./en/playground?endpoint=proxy/info-simplecdrs");
      const pane = desktopPane(page);
      const start = pane.getByTestId("date-field-start");
      await expect(start.locator('input[type="time"]')).toHaveCount(0);
      await pane.getByTestId("request-preview").locator("summary").click();
      await start.locator('input[type="date"]').fill("2026-02-10");
      await expect(pane.getByTestId("request-preview")).toContainText("start=2026-02-10");
    });

    test("a value that is not in the documented format stays editable text, never rewritten (8E)", async ({ page }) => {
      await page.goto("./en/playground?endpoint=openapi/simplecdrs-list");
      const pane = desktopPane(page);
      // The scenario chips / a typed value can set any string; here: an odd value via a Demo chip-free path.
      await expect(pane.getByTestId("date-field-start")).toBeVisible();
      // Fields without a documented format have no picker at all.
      await page.goto("./en/playground?endpoint=openapi/campaigns-create");
      await expect(desktopPane(page).locator('input[type="date"]')).toHaveCount(0);
      await expect(desktopPane(page).getByRole("textbox", { name: /^datestart/ })).toBeVisible();
    });

    test("pickers work on a narrow screen (8E)", async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto("./en/playground?endpoint=openapi/simplecdrs-list");
      const mobile = page.locator("div.md\\:hidden");
      const start = mobile.getByTestId("date-field-start");
      await mobile.getByTestId("request-preview").locator("summary").click();
      // A fill before React hydrates leaves the DOM value but not the state: retry until the
      // state-derived request preview shows it (same race as the nav-drawer and search tests).
      await expect(async () => {
        await start.locator('input[type="date"]').fill("2026-04-07");
        await expect(mobile.getByTestId("request-preview")).toContainText("start=2026-04-07+00%3A00%3A00", { timeout: 500 });
      }).toPass({ timeout: 10_000 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)).toBe(false);
    });

    test("a read with no Demo data still shows the request it would make (8C)", async ({ page }) => {
      await page.goto("./en/playground?endpoint=openapi/cdrs-list");
      const pane = desktopPane(page);
      await pane.getByRole("button", { name: "Send request" }).click();
      await expect(pane.getByText("Demo data not available yet")).toBeVisible({ timeout: 3000 });
      await expect(pane.getByText(/openapi\.php\/cdrs/).filter({ visible: true }).first()).toBeVisible();
      await expect(pane.getByText("X-API-Key: ••••").filter({ visible: true }).first()).toBeVisible();
    });

    test("Reference pages show no internal evidence references or internal notes (Stage 6 C-1)", async ({ page }) => {
      const INTERNAL = /source-docs|SEC-REQ|DOCS_AUDIT|\b(?:OA|A|U)-\d+\b|\b(?:Site|Doc) lines? \d|docs\/SECURITY|\bsrc\/server/;
      for (const path of [
        "./en/reference/openapi/cdrs-list",
        "./en/reference/openapi/extensions-get",
        "./en/reference/proxy/info-extensions",
        "./en/reference/proxy/info-queuelogs",
        "./en/reference/proxy/voicemail-list",
      ]) {
        await page.goto(path);
        const text = await page.locator("main").innerText();
        expect(text, path).not.toMatch(INTERNAL);
      }
      // Customer-useful notes survive; the internal "Security (SEC-REQ-..)" note does not.
      await page.goto("./en/reference/openapi/dial");
      await expect(page.getByText("This places a real phone call.").first()).toBeVisible();
      await page.goto("./en/reference/proxy/info-extensions");
      await expect(page.getByText(/Response formats are observed, not vendor-documented/).first()).toBeVisible();
    });
  });
});

// Phase 9 Stage 3: CSP "lockdown" (src/lib/security-headers.ts). Every page
// must render and work with the policy in force: no violation reports, no
// console errors, across pages, a narrow viewport and a (mocked) Live send.
test.describe("Content-Security-Policy (Phase 9)", () => {
  const pages = [
    "./en",
    "./en/reference/openapi/simplecdrs-list",
    "./en/reference/proxy/info-extensions",
    "./en/guides/getting-started",
    "./en/playground",
    "./en/playground?endpoint=openapi/simplecdrs-list",
  ];

  async function watchCsp(page: Page) {
    await page.addInitScript(() => {
      (window as unknown as { __csp: string[] }).__csp = [];
      document.addEventListener("securitypolicyviolation", (e) => {
        (window as unknown as { __csp: string[] }).__csp.push(`${e.violatedDirective} ${e.blockedURI}`);
      });
    });
    return () => page.evaluate(() => (window as unknown as { __csp: string[] }).__csp);
  }

  test("every page is served with the CSP and related headers", async ({ request }) => {
    for (const url of ["./en", "./en/playground"]) {
      const res = await request.get(url);
      const h = res.headers();
      expect(h["content-security-policy"], url).toContain("connect-src 'self'");
      expect(h["content-security-policy"], url).toContain("frame-ancestors 'none'");
      expect(h["content-security-policy"], url).not.toContain("unsafe-eval");
      expect(h["referrer-policy"], url).toBe("no-referrer");
      expect(h["x-frame-options"], url).toBe("DENY");
    }
  });

  for (const width of [1440, 390]) {
    test(`no CSP violations or console errors at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      const errors = trackConsoleErrors(page);
      const violations = await watchCsp(page);
      for (const url of pages) {
        await page.goto(url);
        await page.waitForLoadState("networkidle");
        expect(await violations(), url).toEqual([]);
      }
      expect(errors).toEqual([]);
    });
  }

  test("a Live send still works under the CSP", async ({ page }) => {
    // Uses the desktop pane; the mobile project's iPhone viewport hides it.
    await page.setViewportSize({ width: 1440, height: 900 });
    const violations = await watchCsp(page);
    await page.route("**/api/playground", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          upstream: { status: 200, latencyMs: 5, sizeBytes: 2, contentType: "application/json", headers: {}, bodyText: "[]" },
        }),
      }),
    );
    await page.goto("./en/playground?endpoint=openapi/simplecdrs-list");
    await page.getByRole("button", { name: "Switch to Live" }).click();
    await page.getByRole("button", { name: "Switch mode" }).click();
    const pane = page.locator(".md\\:grid");
    await pane.getByLabel("API key").fill("not-a-real-key-e2e-only");
    await pane.getByRole("button", { name: "Send request" }).click();
    await expect(pane.getByText(/source: LIVE/)).toBeVisible({ timeout: 3000 });
    expect(await violations()).toEqual([]);
  });
});

// Hebrew removed (2026-10-08): English only, old /he addresses redirect.
test.describe("English only (Hebrew removed)", () => {
  test("old /he addresses redirect to the same /en page, keeping the query", async ({ page }) => {
    await page.goto("./he");
    await expect(page).toHaveURL(/\/en$/);
    await page.goto("./he/reference/proxy/info-extensions");
    await expect(page).toHaveURL(/\/en\/reference\/proxy\/info-extensions$/);
    await page.goto("./he/playground?endpoint=openapi/simplecdrs-list");
    // The redirect may re-encode the query ("/" -> "%2F"); compare decoded values.
    const url = new URL(page.url());
    expect(url.pathname).toMatch(/\/en\/playground$/);
    expect(url.searchParams.get("endpoint")).toBe("openapi/simplecdrs-list");
  });

  test("pages are English, left-to-right, with no language switcher", async ({ page }) => {
    await page.goto("./en");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    await expect(page.getByRole("navigation", { name: "Language" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /עב|עברית|Hebrew/ })).toHaveCount(0);
  });
});
