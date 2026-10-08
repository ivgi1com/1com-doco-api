import { describe, expect, it, vi } from "vitest";
import { getLiveTarget, listLiveHiddenParams } from "@/server/playground/allowlist";
import { getPlaygroundConfig } from "@/server/playground/config";
import { buildUpstreamHeaders, buildUpstreamUrl } from "@/server/playground/execute";
import { handleLiveRequest } from "@/server/playground/handler";
import { createMemoryRateLimiter } from "@/server/playground/rate-limit";
import { validateLiveRequest } from "@/server/playground/validate";

// Phase 9 pilot: openapi/simplecdrs-list. Obviously fake values; the tests
// assert none of them leaks into logs or the upstream URL.
const KEY = "TEST_KEY_do_not_leak_7c1e";
const TENANT = "TESTTENANT";
const ORIGIN = "http://localhost:3000";
const ID = "openapi/simplecdrs-list";
// A fixed "now" so the documented defaults (today 00:00:00 / 23:59:59) are deterministic.
const NOW = new Date(2026, 9, 8, 12, 0, 0);

const base = { endpoint: ID, params: { tenant: TENANT }, credential: KEY };
const withParams = (params: Record<string, string>) => ({ ...base, params: { tenant: TENANT, ...params } });

function row(tenantcode: string, extra: Record<string, unknown> = {}) {
  return {
    sc_te_id: "12",
    tenantcode,
    sc_start: "2026-10-08 09:00:00",
    sc_direction: "IN",
    sc_calleridnum: "0500000000",
    sc_calleridname: "",
    sc_dialednum: "0300000000",
    sc_disposition: "ANSWERED",
    sc_duration: "30",
    sc_billsec: "25",
    sc_uniqueid: "1700000000.1",
    sc_whoanswered: "",
    ...extra,
  };
}

function post(body: unknown) {
  return new Request(`${ORIGIN}/api/playground`, {
    method: "POST",
    headers: { host: "localhost:3000", origin: ORIGIN, "sec-fetch-site": "same-origin", "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function run(body: unknown, upstreamText: string, status = 200) {
  const lines: string[] = [];
  const fetch = vi.fn(async (_url: URL | RequestInfo, _init?: RequestInit) =>
    new Response(upstreamText, { status, headers: { "content-type": "application/json" } }),
  );
  const res = await handleLiveRequest(post(body), {
    config: getPlaygroundConfig({ PLAYGROUND_LIVE_ENABLED: "true" }),
    limiter: createMemoryRateLimiter({ limit: 100, windowMs: 60_000 }),
    fetch: fetch as unknown as typeof globalThis.fetch,
    log: (l) => lines.push(l),
  });
  const env = (await res.json()) as {
    ok: boolean;
    error?: { code: string };
    upstream?: { status: number; bodyText: string; fieldsOmitted: number };
  };
  return { res, env, lines, fetch };
}

function validate(body: unknown) {
  return validateLiveRequest(body, NOW);
}

describe("simplecdrs-list target", () => {
  const t = getLiveTarget(ID)!;

  it("resolves under the Open API base path with header auth", () => {
    expect(t).toMatchObject({
      origin: "https://pbx6webserver.1com.co.il",
      path: "/pbx/openapi.php/simplecdrs",
      method: "GET",
      fixedQuery: { format: "json" },
      credential: { location: "header", name: "X-API-Key" },
      tenantField: "tenantcode",
      dateRange: { start: "start", end: "end", maxDays: 7 },
      errorEnvelope: true,
    });
  });

  it("allows the tenant and the 13 documented filters, nothing else", () => {
    expect([...t.allowedParams].sort()).toEqual(
      [
        "calleridname",
        "calleridnum",
        "dialednum",
        "direction",
        "disposition",
        "end",
        "id",
        "mintalktime",
        "minduration",
        "phone",
        "start",
        "tenant",
        "uniqueid",
        "whoanswered",
      ].sort(),
    );
    for (const name of t.allowedParams) expect(t.paramPatterns.has(name), name).toBe(true);
  });

  it("returns only the 12 observed record fields", () => {
    expect([...t.jsonFields].sort()).toEqual(Object.keys(row("x")).sort());
  });

  it("tells the Playground which documented params to hide", () => {
    expect(listLiveHiddenParams()[ID].sort()).toEqual(["contenttype", "format", "template"]);
    expect(listLiveHiddenParams()["proxy/info-extensions"]).toEqual([]);
  });
});

describe("credential transport", () => {
  it("sends the key only in the X-API-Key header, never in the URL", () => {
    const r = validate(base);
    if (!r.ok) throw new Error("fixture invalid");
    const url = buildUpstreamUrl(r.value);
    expect(url.toString()).toBe(
      `https://pbx6webserver.1com.co.il/pbx/openapi.php/simplecdrs?format=json&tenant=${TENANT}`,
    );
    expect(url.toString()).not.toContain(KEY);
    expect(buildUpstreamHeaders(r.value)).toMatchObject({ "x-api-key": KEY });
  });

  it("keeps the Proxy API key in the query (unchanged contract)", () => {
    const r = validateLiveRequest({ endpoint: "proxy/info-extensions", params: { tenant: TENANT }, credential: KEY });
    if (!r.ok) throw new Error("fixture invalid");
    expect(buildUpstreamUrl(r.value).searchParams.get("key")).toBe(KEY);
    expect(buildUpstreamHeaders(r.value)).not.toHaveProperty("x-api-key");
  });

  it.each(["has space", "tab\there", "näive", "line\nbreak"])("rejects a header-unsafe key %j", (credential) => {
    expect(validate({ ...base, credential })).toEqual({ ok: false, code: "invalid_request" });
  });

  it("passes the key to fetch as a header and never logs it", async () => {
    const { fetch, lines, env } = await run(base, JSON.stringify([row(TENANT)]));
    expect(env.ok).toBe(true);
    const [url, init] = fetch.mock.calls[0];
    expect(String(url)).not.toContain(KEY);
    expect((init?.headers as Record<string, string>)["x-api-key"]).toBe(KEY);
    expect(init?.redirect).toBe("manual");
    for (const l of lines) {
      expect(l).not.toContain(KEY);
      expect(l).not.toContain(TENANT);
      expect(l).not.toContain("0500000000");
    }
  });
});

describe("parameters", () => {
  it.each(["format", "template", "contenttype", "key"])("rejects caller-set %s", (name) => {
    expect(validate(withParams({ [name]: "json" }))).toEqual({ ok: false, code: "invalid_request" });
  });

  it.each([
    ["tenant", "TESTTENANT"],
    ["tenant", "tenant_01.a-b"],
    ["start", "2026-10-07 00:00:00"],
    ["id", "1,22,333"],
    ["uniqueid", "1700000000.1,srv02-1700000001.22"],
    ["calleridnum", "0500000000,+97230000000"],
    ["calleridname", "Dana Levi,דנה"],
    ["dialednum", "*72"],
    ["phone", "0300000000"],
    ["whoanswered", "SIP/101,ext.101,user@x"],
    ["disposition", "ANSWERED,NO ANSWER"],
    ["direction", "IN,OUT,LOCAL"],
    ["minduration", "0"],
    ["mintalktime", "999999"],
  ])("accepts %s=%j", (name, value) => {
    expect(validate(withParams({ [name]: value })).ok).toBe(true);
  });

  it.each([
    ["tenant", "a b"],
    ["tenant", "x&key=1"],
    ["start", "2026-10-07"],
    ["start", "2026-10-07T00:00:00"],
    ["start", "2026-02-30 00:00:00"],
    ["start", "2026-10-07 24:00:00"],
    ["id", "1,,2"],
    ["id", "1;2"],
    ["uniqueid", "abc"],
    ["calleridnum", "050-000"],
    ["calleridname", "<script>"],
    ["dialednum", "1 OR 1=1"],
    ["disposition", "answered"],
    ["direction", "IN;OUT"],
    ["minduration", "-1"],
    ["minduration", "1234567"],
    ["whoanswered", "a b"],
  ])("rejects %s=%j", (name, value) => {
    expect(validate(withParams({ [name]: value }))).toEqual({ ok: false, code: "invalid_request" });
  });
});

describe("date range (max 7 days, documented defaults)", () => {
  it("accepts exactly 7 days", () => {
    expect(validate(withParams({ start: "2026-10-01 00:00:00", end: "2026-10-08 00:00:00" })).ok).toBe(true);
  });

  it("rejects 7 days and 1 second", () => {
    expect(validate(withParams({ start: "2026-10-01 00:00:00", end: "2026-10-08 00:00:01" }))).toEqual({
      ok: false,
      code: "range_too_wide",
    });
  });

  it("applies end = today 23:59:59 when only start is given", () => {
    expect(validate(withParams({ start: "2026-10-02 00:00:00" })).ok).toBe(true);
    expect(validate(withParams({ start: "2026-10-01 23:59:58" }))).toEqual({ ok: false, code: "range_too_wide" });
  });

  it("applies start = today 00:00:00 when only end is given", () => {
    expect(validate(withParams({ end: "2026-10-15 00:00:00" })).ok).toBe(true);
    expect(validate(withParams({ end: "2026-10-15 00:00:01" }))).toEqual({ ok: false, code: "range_too_wide" });
  });

  it("treats blank dates as omitted", () => {
    expect(validate(withParams({ start: " ", end: "" })).ok).toBe(true);
  });

  it("rejects end before start", () => {
    expect(validate(withParams({ start: "2026-10-08 00:00:00", end: "2026-10-07 00:00:00" }))).toEqual({
      ok: false,
      code: "invalid_request",
    });
  });

  it("rejects before any upstream call", async () => {
    const { res, env, fetch } = await run(withParams({ start: "2020-01-01 00:00:00", end: "2020-02-01 00:00:00" }), "[]");
    expect(res.status).toBe(400);
    expect(env.error?.code).toBe("range_too_wide");
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe("responses", () => {
  it("passes the 12 fields and drops anything else", async () => {
    const { env } = await run(base, JSON.stringify([row(TENANT, { sc_secret_extra: "x", recording_path: "/x" })]));
    expect(env.ok).toBe(true);
    const body = JSON.parse(env.upstream!.bodyText) as Record<string, unknown>[];
    expect(Object.keys(body[0]).sort()).toEqual(Object.keys(row(TENANT)).sort());
    expect(env.upstream!.fieldsOmitted).toBe(2);
  });

  it("passes an empty result", async () => {
    const { env } = await run(base, "[]");
    expect(env.upstream!.bodyText).toBe("[]");
  });

  it("blocks an answer spanning more than one tenant, and logs only the event", async () => {
    const { res, env, lines } = await run(base, JSON.stringify([row("TENANTA"), row("TENANTB")]));
    expect(res.status).toBe(403);
    expect(env).toEqual({ ok: false, error: { code: "multi_tenant_blocked" } });
    expect(lines.join("\n")).toContain("multi_tenant_blocked");
    for (const l of lines) expect(l).not.toMatch(/TENANTA|TENANTB|0500000000/);
  });

  it("passes the error envelope with code and message only", async () => {
    const upstream = JSON.stringify({ error: { code: "invalid_api_key", message: "Invalid API key", debug: { k: 1 } } });
    const { env } = await run(base, upstream, 401);
    expect(env.ok).toBe(true);
    expect(env.upstream!.status).toBe(401);
    expect(JSON.parse(env.upstream!.bodyText)).toEqual({ error: { code: "invalid_api_key", message: "Invalid API key" } });
    expect(env.upstream!.fieldsOmitted).toBe(1);
  });

  it("withholds an unexpected JSON shape", async () => {
    const { env } = await run(base, JSON.stringify({ data: [row(TENANT)], total: 1 }));
    expect(env.upstream!.bodyText).toMatch(/withheld/i);
  });
});
