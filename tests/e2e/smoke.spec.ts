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
    await page.goto("/en");
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

    // info-extensions gained Demo fixtures in Phase 6 (see "Demo Mode (Phase
    // 6)" below); cdr-get still has none, so it's the one that still
    // exercises the no-fixture-set fallback ("unavailable" — never a
    // fabricated or replayed response).
    test("Demo mode never fabricates or replays data for an endpoint with no fixtures", async ({ page }) => {
      await page.goto("/en/playground?endpoint=proxy/cdr-get");
      await desktopPane(page).getByRole("button", { name: "Send request" }).click();
      await expect(desktopPane(page).getByText("Demo data not available yet")).toBeVisible({ timeout: 3000 });
      await expect(desktopPane(page).getByText(/status: 200/)).toHaveCount(0);
    });

    test("undocumented-required query parameters never block Send", async ({ page }) => {
      await page.goto("/en/playground?endpoint=proxy/cdr-get");
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
      await page.goto(`/en/playground?endpoint=${endpoint}`);
      await page.getByRole("button", { name: "Switch to Live" }).click();
      await page.getByRole("button", { name: "Switch mode" }).click();
      await desktopPane(page).getByLabel("API key").fill(FAKE_KEY);
    }

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
      await desktopPane(page).getByLabel("uniqueid", { exact: true }).fill("srv02-1701011773.4670");
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
        data: { endpoint: "proxy/cdr-get", params: { uniqueid: "srv02-1.2", field: "src" }, credential: "x" },
      });
      expect(override.status()).toBe(400);
      const listqueues = await request.post("/api/playground", {
        headers,
        data: { endpoint: "proxy/agent-listqueues", params: {}, credential: "x" },
      });
      expect(listqueues.status()).toBe(403);
      expect((await listqueues.json()).error.code).toBe("endpoint_not_allowed");
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
        await page.goto(`/en/playground?endpoint=${endpoint}`);
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
      await page.goto("/en/playground?endpoint=proxy/info-simplecdrs");

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
      await page.goto("/en/playground?endpoint=proxy/info-agents");
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
      await page.goto("/en/playground?endpoint=proxy/info-extensions");
      await expect(desktopPane(page).getByText("Simulate error response")).toHaveCount(0);
      await page.goto("/en/playground?endpoint=sample/list-call-records");
      await expect(desktopPane(page).getByText("Simulate error response")).toBeVisible();
    });

    test("Demo mode makes no network request, across a scenario-chip + Send flow", async ({ page }) => {
      let called = false;
      await page.route("**/api/playground", (route) => {
        called = true;
        return route.abort();
      });
      await page.goto("/en/playground?endpoint=proxy/info-dids");
      await desktopPane(page).getByRole("button", { name: "CSV (empty)" }).click();
      await desktopPane(page).getByRole("button", { name: "Send request" }).click();
      await expect(desktopPane(page).getByText(/status: 200/)).toBeVisible({ timeout: 3000 });
      expect(called).toBe(false);
    });

    test("the Request tab is available for Demo too, explicitly marked not sent", async ({ page }) => {
      await page.goto("/en/playground?endpoint=proxy/info-extensions");
      await desktopPane(page).getByRole("button", { name: "Send request" }).click();
      await expect(desktopPane(page).getByText(/status: 200/)).toBeVisible({ timeout: 3000 });
      await desktopPane(page).getByRole("tab", { name: "Request" }).click();
      await expect(
        desktopPane(page).getByText("Not sent — Demo. This shows what the equivalent Live request would look like."),
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
      await page.goto("/en/playground?endpoint=proxy/info-agents");
      await page.getByRole("button", { name: "Send request" }).first().click();
      await page.getByRole("tab", { name: "Response" }).click();
      await expect(page.getByText(/status: 200/).first()).toBeVisible({ timeout: 3000 });
      await expect(page.getByText("Queue agents (JSON)").first()).toBeVisible();
    });

    // Scenario labels are English-only by content-language decision (Phase 4,
    // demo/types.ts DemoCase.label); the surrounding chrome is Hebrew.
    // Stage 7 remediation: the resolved-default assertion now targets "DID
    // list (JSON)" (see the defaultResolves comment above); the chip
    // assertion below intentionally keeps checking for the "(plain)" chip,
    // which still exists as a non-default scenario option.
    test("he: scenario labels and the response stay English while the surrounding UI is Hebrew", async ({ page }) => {
      await page.goto("/he/playground?endpoint=proxy/info-dids");
      // Mobile step-flow and desktop grid are both mounted (CSS-hidden, not
      // JS-unmounted), each with its own legend; scope to the desktop pane
      // (this test uses the default desktop-sized viewport) like the rest of
      // this file does.
      await expect(desktopPane(page).getByText("תרחישים")).toBeVisible(); // "Scenarios" legend
      const chip = page.getByRole("button", { name: "DID list (plain)" });
      await expect(chip).toBeVisible();
      await page.getByRole("button", { name: "שליחת הבקשה" }).first().click();
      await expect(page.getByText(/status: 200/).first()).toBeVisible({ timeout: 3000 });
      await expect(page.getByText("תרחיש:").first()).toBeVisible(); // "Scenario:" label
      // Scoped to the response's own scenario line, not any occurrence of
      // the label text (the chip button above is a second, always-rendered
      // match) — same fix as the defaultResolves loop.
      const scenarioLine = desktopPane(page).locator("p", { hasText: "תרחיש:" });
      await expect(scenarioLine).toContainText("DID list (JSON)");
    });

    // Superseded note (Stage 7 remediation): see the "scenario chips switch"
    // test above — default Send now resolves "Calls, unfiltered (JSON)"
    // directly (covered for he by the "scenario labels...stay English"
    // test above, using info-dids), so there is no longer a "Not simulated"
    // state to exercise here. This test now covers a chip switch instead
    // (matched → no-match), still verifying Hebrew chrome around an
    // English-labelled scenario.
    test("he: a scenario chip switch stays English-labelled while the surrounding UI is Hebrew", async ({ page }) => {
      await page.goto("/he/playground?endpoint=proxy/info-simplecdrs");
      await page.getByRole("button", { name: "Calls, phone match (JSON)" }).first().click();
      await page.getByRole("button", { name: "שליחת הבקשה" }).first().click();
      await expect(page.getByText(/status: 200/).first()).toBeVisible({ timeout: 3000 });
      await expect(page.getByText("תרחיש:").first()).toBeVisible(); // "Scenario:" label
      await expect(page.getByText("Calls, phone match (JSON)").last()).toBeVisible();
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
      await page.goto("/en/playground?endpoint=proxy/info-queuelogs");
      await desktopPane(page).getByRole("button", { name: "Send request" }).click();
      await expect(desktopPane(page).getByText(/status: 200/)).toBeVisible({ timeout: 3000 });
      await expect(desktopPane(page).getByText("Abandoned call (JSON)").last()).toBeVisible();
      await expect(desktopPane(page).getByTestId("json-content").getByText('"ABANDONED"').first()).toBeVisible();
    });

    test("info-queuelogs: the no-data JSON chip reproduces the single-byte ] body", async ({ page }) => {
      await page.goto("/en/playground?endpoint=proxy/info-queuelogs");
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
      await page.goto("/en/reference/proxy/dial");
      await expect(page.getByRole("heading", { name: "Place a call" })).toBeVisible();
      await expect(page.getByText("Changes state — reference only")).toBeVisible();
      await expect(page.getByRole("link", { name: "Try in Playground" })).toHaveCount(0);
      const panel = await requestPanel(page);
      await expect(panel.getByTestId("reference-only")).toBeVisible();
      await expect(panel.getByText("Vendor sample")).toBeVisible();
      await expect(panel.getByText("Success|Originate successfully queued|15a4cfe6429054|")).toBeVisible();
    });

    test("a write operation never sends from the Playground, in Demo or Live", async ({ page }) => {
      await page.goto("/en/playground?endpoint=proxy/dial");
      const send = desktopPane(page).getByRole("button", { name: "Send request" });
      await expect(send).toBeDisabled();
      await expect(desktopPane(page).getByTestId("write-only-note")).toBeVisible();
      await page.getByRole("button", { name: "Switch to Live" }).click();
      await page.getByRole("button", { name: "Switch mode" }).click();
      await expect(send).toBeDisabled();
      await expect(desktopPane(page).getByTestId("write-only-note")).toBeVisible();
    });

    test("a ManageDB write documents its jsondata body, admin key, and a form-encoded POST sample", async ({ page }) => {
      await page.goto("/en/reference/proxy/managedb-custom-add");
      await expect(page.getByText(/with one field, jsondata, whose value is the object below encoded as JSON/)).toBeVisible();
      await expect(page.locator('section[aria-labelledby="authentication"]').getByText("Key scope: Admin key")).toBeVisible();
      const panel = await requestPanel(page);
      await expect(panel.getByText(/--url-query "reqtype=MANAGEDB"/)).toBeVisible();
      await expect(panel.getByText(/--data-urlencode 'jsondata=/)).toBeVisible();
    });

    test("a binary response says so instead of 'No response body'", async ({ page }) => {
      await page.goto("/en/reference/proxy/info-recording");
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
      await page.goto("/en/reference/proxy");
      await expect(page.getByRole("heading", { name: "Proxy" }).first()).toBeVisible();
      await page.locator("aside").getByLabel("API").selectOption("openapi");
      await expect(page).toHaveURL(/\/en\/reference\/openapi$/);
      await expect(page.getByRole("heading", { name: "MiRTA OpenAPI" }).first()).toBeVisible();
    });

    test("a path-parameter endpoint documents its example placeholder and prefills it in the Playground", async ({ page }) => {
      await page.goto("/en/reference/openapi/extensions-get");
      await expect(page.getByRole("heading", { name: "Get extension" })).toBeVisible();
      const panel = await requestPanel(page);
      // The example value the code sample substitutes into the path.
      await expect(panel.getByText(/\/extensions\/OBJECT_ID/)).toBeVisible();
      await panel.getByRole("link", { name: "Try in Playground" }).click();
      await expect(page).toHaveURL(/endpoint=openapi\/extensions-get/);
      await expect(desktopPane(page).getByLabel("ex_id")).toHaveValue("OBJECT_ID");
    });

    test("a write operation is reference-only: warning callout, no Try link, no Send", async ({ page }) => {
      await page.goto("/en/reference/openapi/dial");
      await expect(page.getByRole("heading", { name: "Originate a call" })).toBeVisible();
      await expect(page.getByText("Changes state — reference only")).toBeVisible();
      await expect(page.getByRole("link", { name: "Try in Playground" })).toHaveCount(0);
      const panel = await requestPanel(page);
      await expect(panel.getByTestId("reference-only")).toBeVisible();

      await page.goto("/en/playground?endpoint=openapi/dial");
      await expect(desktopPane(page).getByRole("button", { name: "Send request" })).toBeDisabled();
      await expect(desktopPane(page).getByTestId("write-only-note")).toBeVisible();
    });

    const demoFixtures: { endpoint: string; label: string }[] = [
      { endpoint: "openapi/extensions-state-get", label: "Registered, active channel" },
      { endpoint: "openapi/ailogs-list", label: "AI logs found (JSON)" },
      { endpoint: "openapi/aianalysis-get", label: "Analysis found (JSON)" },
    ];

    for (const { endpoint, label } of demoFixtures) {
      test(`${endpoint}: default field values resolve its documented-example Demo scenario`, async ({ page }) => {
        await page.goto(`/en/playground?endpoint=${endpoint}`);
        await desktopPane(page).getByRole("button", { name: "Send request" }).click();
        await expect(desktopPane(page).getByText(/status: 200/)).toBeVisible({ timeout: 3000 });
        const scenarioLine = desktopPane(page).locator("p", { hasText: "Scenario:" });
        await expect(scenarioLine).toBeVisible();
        await expect(scenarioLine).toContainText(label);
        await expect(desktopPane(page).getByText("Not simulated")).toHaveCount(0);
      });
    }

    test("ailogs-list: an unfixtured format=csv shows Not simulated, not a guess", async ({ page }) => {
      await page.goto("/en/playground?endpoint=openapi/ailogs-list");
      await desktopPane(page).getByLabel("format", { exact: true }).selectOption("csv");
      await desktopPane(page).getByRole("button", { name: "Send request" }).click();
      await expect(desktopPane(page).getByText("Not simulated")).toBeVisible({ timeout: 3000 });
    });

    test("cdrs-list: a GET with no fixture shows Demo data not available, never a guess", async ({ page }) => {
      await page.goto("/en/playground?endpoint=openapi/cdrs-list");
      await desktopPane(page).getByRole("button", { name: "Send request" }).click();
      await expect(desktopPane(page).getByText("Demo data not available yet")).toBeVisible({ timeout: 3000 });
    });
  });
});
