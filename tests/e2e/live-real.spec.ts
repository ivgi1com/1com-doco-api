import { expect, test } from "@playwright/test";

/**
 * Phase 9: the one e2e file that talks to the real 1com PBX, through this
 * app's own /api/playground proxy. It is SKIPPED unless both variables are
 * set in the shell that runs it:
 *
 *   OPENAPI_TEST_KEY      a tenant API Key (never written to disk or logged)
 *   OPENAPI_TEST_TENANT   that key's tenant code
 *
 * Run it with the list reporter and from a shell that holds the key, e.g.
 *   npx playwright test tests/e2e/live-real.spec.ts --project=chromium-desktop --reporter=list
 *
 * Call data is personal data. Nothing here prints it: assertions use counts
 * and booleans only, trace/screenshot/video are off, and the one browser test
 * filters to an empty result so no call record is ever rendered. The HTML
 * reporter must not be used for this file (it would embed failure details).
 * Three real calls per run; the proxy allows 10 per minute.
 */
const KEY = process.env.OPENAPI_TEST_KEY ?? "";
const TENANT = process.env.OPENAPI_TEST_TENANT ?? "";
const ENDPOINT = "openapi/simplecdrs-list";
const ALLOWED_FIELDS = new Set([
  "sc_te_id",
  "tenantcode",
  "sc_start",
  "sc_direction",
  "sc_calleridnum",
  "sc_calleridname",
  "sc_dialednum",
  "sc_disposition",
  "sc_duration",
  "sc_billsec",
  "sc_uniqueid",
  "sc_whoanswered",
]);

// No trace, screenshot or video for this file: failures must not persist call data.
test.use({ trace: "off", screenshot: "off", video: "off" });

test.describe("Open API Live against the real PBX (Phase 9)", () => {
  test.skip(!KEY || !TENANT, "OPENAPI_TEST_KEY and OPENAPI_TEST_TENANT are not set");
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "chromium-desktop", "one browser is enough for real calls");
  });
  const origin = (baseURL: string | undefined) => new URL(baseURL ?? "http://localhost:3000").origin;

  test("today's calls come back with only the allowlisted fields, for one tenant, and never the key", async ({
    request,
    baseURL,
  }) => {
    // No start/end: the documented default is today, a range far under the 3-day limit.
    const res = await request.post("./api/playground", {
      headers: { origin: origin(baseURL), "content-type": "application/json" },
      data: { endpoint: ENDPOINT, params: { tenant: TENANT }, credential: KEY },
    });
    const text = await res.text();
    expect(res.status()).toBe(200);
    expect(text.includes(KEY), "response contains the key").toBe(false);

    const env = JSON.parse(text) as { ok: boolean; error?: { code: string }; upstream?: { status: number; bodyText: string } };
    expect(env.ok, `portal error code: ${env.error?.code}`).toBe(true);
    expect(env.upstream?.status, "upstream status").toBe(200);

    const rows = JSON.parse(env.upstream!.bodyText) as Record<string, unknown>[];
    expect(Array.isArray(rows), "body is an array").toBe(true);
    const unexpectedFields = new Set(rows.flatMap((r) => Object.keys(r)).filter((k) => !ALLOWED_FIELDS.has(k)));
    expect(unexpectedFields.size, "records with fields outside the allowlist").toBe(0);
    const tenants = new Set(rows.map((r) => r.tenantcode));
    expect(tenants.size, "distinct tenants in the answer").toBeLessThanOrEqual(1);
  });

  test("a wrong key is answered by the PBX as an error envelope with only code and message", async ({ request, baseURL }) => {
    const res = await request.post("./api/playground", {
      headers: { origin: origin(baseURL), "content-type": "application/json" },
      data: { endpoint: ENDPOINT, params: { tenant: TENANT }, credential: "not-a-real-key-e2e-only" },
    });
    const env = (await res.json()) as { ok: boolean; upstream?: { status: number; bodyText: string } };
    expect(env.ok).toBe(true);
    expect(env.upstream?.status).toBe(401);
    const body = JSON.parse(env.upstream!.bodyText) as { error?: Record<string, unknown> };
    expect(Object.keys(body)).toEqual(["error"]);
    expect(Object.keys(body.error ?? {}).sort()).toEqual(["code", "message"]);
    expect(body.error?.code).toBe("invalid_api_key");
  });

  test("the Playground sends a real Live request and shows the LIVE response (empty result, no call data)", async ({ page }) => {
    await page.goto("./en/playground?endpoint=openapi/simplecdrs-list");
    await page.getByRole("button", { name: "Switch to Live" }).click();
    await page.getByRole("button", { name: "Switch mode" }).click();
    const pane = page.locator(".md\\:grid");
    await pane.getByLabel("API key").fill(KEY);
    await pane.getByLabel("tenant", { exact: true }).fill(TENANT);
    // No call lasts this long: the answer is an empty array, so no record is rendered or snapshotted.
    await pane.getByLabel("minduration", { exact: true }).fill("999999");
    await pane.getByRole("button", { name: "Send request" }).click();
    await expect(pane.getByText(/source: LIVE/)).toBeVisible({ timeout: 15_000 });
    await expect(pane.getByText(/status: 200/)).toBeVisible();
  });
});
