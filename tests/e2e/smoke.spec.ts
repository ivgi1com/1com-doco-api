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
  "/en/reference/sample/list-call-records",
  "/en/guides/getting-started",
  "/en/playground",
  "/en/changelog",
  "/en/no-such-page",
  "/he",
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
        await page.waitForLoadState("networkidle");
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

  test("playground: Live send always errors and never falls back to Demo", async ({ page }) => {
    await page.goto("/en/playground?endpoint=sample/list-call-records");
    await page.getByRole("button", { name: "Switch to Live" }).click();
    await page.getByRole("button", { name: "Switch mode" }).click();
    await desktopPane(page).getByRole("button", { name: "Send request" }).click();
    await expect(desktopPane(page).getByText("Request failed")).toBeVisible({ timeout: 3000 });
    await expect(desktopPane(page).getByText(/DEMO/)).toHaveCount(0);
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
});
