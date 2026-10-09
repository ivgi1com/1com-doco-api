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
 * At most eight real calls per run (Phase 9 + Phase 11 below); the proxy
 * allows 10 per minute. The Phase 11 Proxy API check also needs
 * PROXY_TEST_KEY and PROXY_TEST_TENANT; without them it is skipped.
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

/**
 * Phase 11: Phase 10 made every read Live with redaction as the only output
 * control (pass-through targets). These checks run the same real-PBX setup
 * against a sample of those reads. Assertions are counts and booleans only.
 * Five more real calls (four Open API, one optional Proxy); the blocked read
 * never reaches the PBX. With the three above: at most 8 per run.
 */

// Copy of redact.ts SENSITIVE_NAME (that module is server-only). Keep in sync.
const SENSITIVE_NAME = /pass(word|wd)?|pwd|secret|token|2fa|otp|mfa|pin(?![a-z])|api_?key/i;

/** Every value under a sensitive-named key, at any depth, that is still shown. */
function unredactedSecrets(value: unknown): number {
  if (Array.isArray(value)) return value.reduce<number>((n, v) => n + unredactedSecrets(v), 0);
  if (!value || typeof value !== "object") return 0;
  let n = 0;
  for (const [k, v] of Object.entries(value)) {
    // A boolean flag (e.g. "2fa enabled") carries no secret; redact.ts leaves it, by design.
    const safe = v === "" || v === null || v === "[REDACTED]" || typeof v === "boolean";
    if (SENSITIVE_NAME.test(k) && !safe) n++;
    else n += unredactedSecrets(v);
  }
  return n;
}

/** First value of `field` found in any record, at any depth. */
function firstField(value: unknown, field: string): unknown {
  if (Array.isArray(value)) {
    for (const v of value) {
      const found = firstField(v, field);
      if (found !== undefined) return found;
    }
    return undefined;
  }
  if (!value || typeof value !== "object") return undefined;
  if (Object.hasOwn(value, field)) return (value as Record<string, unknown>)[field];
  return firstField(Object.values(value), field);
}

test.describe("Live for every read against the real PBX (Phase 11)", () => {
  test.skip(!KEY || !TENANT, "OPENAPI_TEST_KEY and OPENAPI_TEST_TENANT are not set");
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== "chromium-desktop", "one browser is enough for real calls");
  });
  const origin = (baseURL: string | undefined) => new URL(baseURL ?? "http://localhost:3000").origin;

  type Envelope = { ok: boolean; error?: { code: string }; upstream?: { status: number; bodyText: string } };
  async function live(
    request: import("@playwright/test").APIRequestContext,
    baseURL: string | undefined,
    data: { endpoint: string; params?: Record<string, string>; pathParams?: Record<string, string>; credential: string },
  ): Promise<{ httpStatus: number; text: string; env: Envelope }> {
    const res = await request.post("./api/playground", {
      headers: { origin: origin(baseURL), "content-type": "application/json" },
      data,
    });
    const text = await res.text();
    return { httpStatus: res.status(), text, env: JSON.parse(text) as Envelope };
  }

  /** Upstream 200, JSON body, no key echoed. Returns the parsed body. */
  function expectJson200(endpoint: string, key: string, r: { httpStatus: number; text: string; env: Envelope }): unknown {
    expect(r.httpStatus, `${endpoint}: portal HTTP status`).toBe(200);
    expect(r.text.includes(key), `${endpoint}: response contains the key`).toBe(false);
    expect(r.env.ok, `${endpoint}: portal error code: ${r.env.error?.code}`).toBe(true);
    expect(r.env.upstream?.status, `${endpoint}: upstream status`).toBe(200);
    let body: unknown;
    expect(() => (body = JSON.parse(r.env.upstream!.bodyText)), `${endpoint}: body is JSON (not withheld)`).not.toThrow();
    return body;
  }

  test("queues-list returns a list, and queues-get reads its first record by path parameter", async ({ request, baseURL }) => {
    const list = expectJson200("openapi/queues-list", KEY, await live(request, baseURL, {
      endpoint: "openapi/queues-list",
      params: { tenant: TENANT },
      credential: KEY,
    }));
    expect(unredactedSecrets(list), "queues-list: secret-named fields with a value").toBe(0);

    const id = firstField(list, "qu_id");
    test.skip(id === undefined || id === null || id === "", "the tenant has no queues; queues-get not checked");
    const one = expectJson200("openapi/queues-get", KEY, await live(request, baseURL, {
      endpoint: "openapi/queues-get",
      params: { tenant: TENANT },
      pathParams: { qu_id: String(id) },
      credential: KEY,
    }));
    expect(one !== null && typeof one === "object", "queues-get: body is an object or array").toBe(true);
    expect(unredactedSecrets(one), "queues-get: secret-named fields with a value").toBe(0);
  });

  for (const endpoint of ["openapi/extensions-list", "openapi/voicemails-list"]) {
    test(`${endpoint}: every secret-named field is redacted`, async ({ request, baseURL }) => {
      const body = expectJson200(endpoint, KEY, await live(request, baseURL, {
        endpoint,
        params: { tenant: TENANT },
        credential: KEY,
      }));
      expect(unredactedSecrets(body), `${endpoint}: secret-named fields with a value`).toBe(0);
    });
  }

  test("a blocked read (AI Analysis) is refused by the portal, before the PBX", async ({ request, baseURL }) => {
    const r = await live(request, baseURL, {
      endpoint: "openapi/aianalysis-get",
      params: { tenant: TENANT },
      pathParams: { id: "1" },
      credential: KEY,
    });
    expect(r.httpStatus).toBe(403);
    expect(r.env.ok).toBe(false);
    expect(r.env.error?.code).toBe("endpoint_not_allowed");
    expect(r.env.upstream).toBeUndefined();
  });

  const PROXY_KEY = process.env.PROXY_TEST_KEY ?? "";
  const PROXY_TENANT = process.env.PROXY_TEST_TENANT ?? "";
  test("Proxy API: info-queues returns JSON with no secret-named value", async ({ request, baseURL }) => {
    test.skip(!PROXY_KEY || !PROXY_TENANT, "PROXY_TEST_KEY and PROXY_TEST_TENANT are not set");
    const body = expectJson200("proxy/info-queues", PROXY_KEY, await live(request, baseURL, {
      endpoint: "proxy/info-queues",
      params: { tenant: PROXY_TENANT, format: "json" },
      credential: PROXY_KEY,
    }));
    expect(unredactedSecrets(body), "info-queues: secret-named fields with a value").toBe(0);
  });
});
