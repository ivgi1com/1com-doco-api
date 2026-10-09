import { describe, expect, it, vi } from "vitest";
import { getLiveTarget } from "@/server/playground/allowlist";
import { getPlaygroundConfig } from "@/server/playground/config";
import { buildUpstreamUrl } from "@/server/playground/execute";
import { handleLiveRequest } from "@/server/playground/handler";
import { createMemoryRateLimiter } from "@/server/playground/rate-limit";
import { REDACTED, redactSensitive } from "@/server/playground/redact";
import { validateLiveRequest } from "@/server/playground/validate";

// Phase 10: every read Live, pass-through + redaction. Obviously fake values.
const KEY = "TEST_KEY_do_not_leak_5c7e";
const TENANT = "TEST_TENANT_88aa";
const ORIGIN = "http://localhost:3000";
const SECRET = "s3cr3t-Value-9f1";

function post(body: unknown) {
  return new Request(`${ORIGIN}/api/playground`, {
    method: "POST",
    headers: { host: "localhost:3000", origin: ORIGIN, "sec-fetch-site": "same-origin", "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function run(body: unknown, upstreamText: string) {
  const lines: string[] = [];
  const fetch = vi.fn<(url: URL, init?: RequestInit) => Promise<Response>>(
    async () => new Response(upstreamText, { headers: { "content-type": "application/json" } }),
  );
  const res = await handleLiveRequest(post(body), {
    config: getPlaygroundConfig({ PLAYGROUND_LIVE_ENABLED: "true" }),
    limiter: createMemoryRateLimiter({ limit: 100, windowMs: 60_000 }),
    fetch: fetch as unknown as typeof globalThis.fetch,
    log: (l) => lines.push(l),
  });
  const env = (await res.json()) as { ok: boolean; upstream?: { bodyText: string; redactedCount: number; fieldsOmitted: number }; error?: { code: string } };
  return { res, env, lines, fetch };
}

const queueGet = (id: unknown) => ({ endpoint: "openapi/queues-get", params: { tenant: TENANT }, pathParams: { qu_id: id }, credential: KEY });

describe("path parameters (openapi/queues-get)", () => {
  const t = getLiveTarget("openapi/queues-get")!;

  it("is a pass-through target with one path parameter under the OpenAPI base path", () => {
    expect(t).toMatchObject({
      origin: "https://pbx6webserver.1com.co.il",
      path: "/pbx/openapi.php/queues/{qu_id}",
      pathParams: ["qu_id"],
      projection: "passthrough",
      credential: { location: "header", name: "X-API-Key" },
      errorEnvelope: true,
    });
  });

  it("substitutes the validated value into the path; the key never enters the URL", () => {
    const r = validateLiveRequest(queueGet("100"));
    if (!r.ok) throw new Error("fixture invalid");
    const url = buildUpstreamUrl(r.value);
    expect(url.pathname).toBe("/pbx/openapi.php/queues/100");
    expect(url.toString()).not.toContain(KEY);
  });

  it("encodes @ and + rather than passing them raw", () => {
    const r = validateLiveRequest(queueGet("a@b+c"));
    if (!r.ok) throw new Error("fixture invalid");
    expect(buildUpstreamUrl(r.value).pathname).toBe("/pbx/openapi.php/queues/a%40b%2Bc");
  });

  it.each([
    ["missing", undefined],
    ["empty", ""],
    ["dot", "."],
    ["dot-dot", ".."],
    ["slash", "1/2"],
    ["encoded slash", "1%2F2"],
    ["backslash", "1\\2"],
    ["query", "1?x=1"],
    ["fragment", "1#x"],
    ["space", "1 2"],
    ["too long", "1".repeat(65)],
    ["number", 100],
  ])("rejects a %s value", (_label, value) => {
    expect(validateLiveRequest(queueGet(value))).toEqual({ ok: false, code: "invalid_request" });
  });

  it("rejects unknown or extra path parameters, and path parameters on a target without any", () => {
    expect(validateLiveRequest({ ...queueGet("1"), pathParams: { qu_id: "1", other: "2" } }).ok).toBe(false);
    expect(validateLiveRequest({ ...queueGet("1"), pathParams: { other: "1" } }).ok).toBe(false);
    expect(validateLiveRequest({ ...queueGet("1"), pathParams: ["1"] }).ok).toBe(false);
    expect(
      validateLiveRequest({ endpoint: "openapi/queues-list", params: {}, pathParams: { qu_id: "1" }, credential: KEY }).ok,
    ).toBe(false);
  });
});

describe("pass-through output", () => {
  it("returns the upstream JSON unchanged apart from redaction, and logs no values", async () => {
    const upstream = JSON.stringify({ qu_id: "100", qu_name: "Support", qu_password: SECRET, nested: { pin: "4321" } });
    const { res, env, lines, fetch } = await run(queueGet("100"), upstream);
    expect(res.status).toBe(200);
    const body = JSON.parse(env.upstream!.bodyText);
    expect(body).toEqual({ qu_id: "100", qu_name: "Support", qu_password: REDACTED, nested: { pin: REDACTED } });
    expect(env.upstream!.fieldsOmitted).toBe(0);
    expect(env.upstream!.redactedCount).toBe(2);
    const [, init] = fetch.mock.calls[0];
    expect((init!.headers as Record<string, string>)["x-api-key"]).toBe(KEY);
    const log = lines.join("\n");
    for (const v of [KEY, TENANT, SECRET, "Support", "100"]) expect(log).not.toContain(v);
  });

  it("passes the documented error envelope through as code + message only", async () => {
    const upstream = JSON.stringify({ error: { code: "invalid_api_key", message: "Invalid API key", debug: "x" } });
    const { env } = await run(queueGet("100"), upstream);
    expect(JSON.parse(env.upstream!.bodyText)).toEqual({ error: { code: "invalid_api_key", message: "Invalid API key" } });
  });

  it("refuses blocked operations even though they are reads", async () => {
    for (const endpoint of ["openapi/aianalysis-get", "openapi/disas-list", "proxy/info-recording", "proxy/info-voicemail"]) {
      const { env, fetch } = await run({ endpoint, params: {}, credential: KEY }, "[]");
      expect(env.error?.code, endpoint).toBe("endpoint_not_allowed");
      expect(fetch).not.toHaveBeenCalled();
    }
  });
});

describe("redaction of sibling copies of a secret", () => {
  it("redacts positional duplicates of a sensitive value in the same record", () => {
    const input = JSON.stringify([{ "0": "201", "1": SECRET, ex_number: "201", ex_password: SECRET }]);
    const out = JSON.parse(redactSensitive(input).text);
    expect(out).toEqual([{ "0": "201", "1": REDACTED, ex_number: "201", ex_password: REDACTED }]);
  });

  it("does not hunt for very short secrets (flags), to avoid blanking unrelated fields", () => {
    const input = JSON.stringify({ ex_2fa: "1", ex_enabled: "1", ex_number: "1" });
    expect(JSON.parse(redactSensitive(input).text)).toEqual({ ex_2fa: REDACTED, ex_enabled: "1", ex_number: "1" });
  });

  it("withholds free text and name|value rows that name a secret it cannot locate", () => {
    expect(redactSensitive(`Tenant: ACME\nRecording password: ${SECRET}\n`).text).not.toContain(SECRET);
    expect(redactSensitive(`name|value\nte_name|ACME\nte_recpassword|${SECRET}\n`).text).not.toContain(SECRET);
    expect(redactSensitive("name|value\nte_name|ACME\n").redacted).toBe(0);
  });

  it("treats API-key-named fields as secrets", () => {
    const out = JSON.parse(redactSensitive(JSON.stringify({ te_apikey: SECRET, te_api_key: SECRET })).text);
    expect(out).toEqual({ te_apikey: REDACTED, te_api_key: REDACTED });
  });
});

// Phase 11 real-PBX finding: openapi/queues-list returned a Proxy key inside a
// queue's webhook URL (`qu_notifyabandonedurl`, `key=` query parameter).
describe("keys inside URLs and echoes of the caller's key (Phase 11)", () => {
  const OTHER_KEY = "OTHER_tenant_key_77b1";
  const hook = (key: string) => `https://hooks.example.test/x.php?tenant=T1&key=${key}&reqtype=CAMPAIGN&number=100`;

  it("redacts the caller's key and a URL's `key=` value end to end (queues-list, PHP-escaped slashes)", async () => {
    const upstream = JSON.stringify([
      { qu_id: "1", qu_notifyabandonedurl: hook(KEY), qu_api_url: hook(OTHER_KEY) },
    ]).replaceAll("/", "\/");
    const { env } = await run({ endpoint: "openapi/queues-list", params: { tenant: TENANT }, credential: KEY }, upstream);
    expect(env.ok).toBe(true);
    const text = env.upstream!.bodyText;
    expect(text).not.toContain(KEY);
    expect(text).not.toContain(OTHER_KEY);
    const [row] = JSON.parse(text) as Record<string, string>[];
    expect(row.qu_notifyabandonedurl).toBe(hook(REDACTED));
    expect(row.qu_api_url).toBe(hook(REDACTED));
    expect(env.upstream!.redactedCount).toBe(2);
  });

  it("scrubs the caller's key under any field name, also URL-encoded", () => {
    const key = "k/ey+1";
    const r = redactSensitive(JSON.stringify({ note: `x${key}y`, link: `p?a=${encodeURIComponent(key)}` }), key);
    expect(r.text).not.toContain(key);
    expect(r.text).not.toContain(encodeURIComponent(key));
    expect(JSON.parse(r.text)).toEqual({ note: `x${REDACTED}y`, link: `p?a=${REDACTED}` });
  });

  it("scrubs the caller's key in plain-text and error-envelope bodies", () => {
    expect(redactSensitive(`id|label\n1|${KEY}\n`, KEY).text).not.toContain(KEY);
    expect(redactSensitive(JSON.stringify({ error: { code: "x", message: `bad ${KEY}` } }), KEY).text).not.toContain(KEY);
  });

  it("redacts secret-named query parameters in URLs, in JSON, plain text and XML", () => {
    for (const name of ["key", "KEY", "apikey", "api_key", "token", "password", "secret"]) {
      const url = `https://h.test/p?${name}=${SECRET}&n=1`;
      expect(redactSensitive(JSON.stringify({ u: url })).text, name).not.toContain(SECRET);
      expect(redactSensitive(`id|url\n1|${url}\n`).text, name).not.toContain(SECRET);
    }
    const xml = `<q><url>https://h.test/p?a=1&amp;key=${SECRET}</url></q>`;
    expect(redactSensitive(xml).text).toBe(`<q><url>https://h.test/p?a=1&amp;key=${REDACTED}</url></q>`);
  });

  it("leaves ordinary URLs and non-URL `key=` text alone", () => {
    const input = JSON.stringify({ u: "https://h.test/p?tenant=T1&number=100&monkey=1", note: "key=value" });
    expect(redactSensitive(input)).toEqual({ text: input, redacted: 0 });
    expect(redactSensitive(input, "")).toEqual({ text: input, redacted: 0 });
  });
});
