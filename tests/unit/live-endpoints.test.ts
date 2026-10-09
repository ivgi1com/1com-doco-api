import { describe, expect, it, vi } from "vitest";
import { getApi, getEndpoint, listEndpoints } from "@/content";
import { getLiveTarget, listLiveTargetIds } from "@/server/playground/allowlist";
import { getPlaygroundConfig } from "@/server/playground/config";
import { buildUpstreamUrl } from "@/server/playground/execute";
import { handleLiveRequest } from "@/server/playground/handler";
import { createMemoryRateLimiter } from "@/server/playground/rate-limit";
import { WITHHELD } from "@/server/playground/redact";
import { validateLiveRequest } from "@/server/playground/validate";

// Phase 5 adjustment: info-agents (A-43) and cdr-get (A-42). Obviously fake
// values; the tests assert none of them leaks into logs.
const KEY = "TEST_KEY_do_not_leak_91b2";
const TENANT = "TEST_TENANT_4d0a";
const QUEUE = "73519";
const UNIQUEID = "srvtest-1700000000.4242";
const ORIGIN = "http://localhost:3000";

const agents = { endpoint: "proxy/info-agents", params: { tenant: TENANT, queue: QUEUE }, credential: KEY };
const cdr = { endpoint: "proxy/cdr-get", params: { tenant: TENANT, uniqueid: UNIQUEID }, credential: KEY };

function post(body: unknown) {
  return new Request(`${ORIGIN}/api/playground`, {
    method: "POST",
    headers: { host: "localhost:3000", origin: ORIGIN, "sec-fetch-site": "same-origin", "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function run(body: unknown, upstreamText: string, contentType = "application/json") {
  const lines: string[] = [];
  const fetch = vi.fn(async () => new Response(upstreamText, { headers: { "content-type": contentType } }));
  const res = await handleLiveRequest(post(body), {
    config: getPlaygroundConfig({ PLAYGROUND_LIVE_ENABLED: "true" }),
    limiter: createMemoryRateLimiter({ limit: 100, windowMs: 60_000 }),
    fetch,
    log: (l) => lines.push(l),
  });
  const env = (await res.json()) as { ok: boolean; upstream: { bodyText: string; fieldsOmitted: number; redactedCount: number } };
  return { res, env, lines, fetch };
}

describe("Live allowlist membership", () => {
  // Phase 10 (2026-10-08, user decision): every GET classified "read", minus
  // the categorical blocks. A change to this count is a security decision.
  const BLOCKED = new Set([
    "openapi/aianalysis-get",
    "openapi/ailogs-list",
    "openapi/disas-list",
    "openapi/disas-get",
    "proxy/info-voicemail",
    "proxy/voicemail-message",
    "proxy/info-recording",
    "proxy/info-playrecording",
    "proxy/info-inforecording",
    "proxy/info-voicemailtranscript",
    "proxy/mediafile-getaudio",
  ]);

  // Approved one by one before Phase 10 (U-08, A-42/A-43, SEC-REQ-08); the
  // three Proxy ones carry no operationClass in the content model.
  const STRICT = ["openapi/simplecdrs-list", "proxy/cdr-get", "proxy/info-agents", "proxy/info-extensions"];

  it("is every documented read of Open API and Proxy API except the blocked ones, plus the strict policies", () => {
    const reads = (["openapi", "proxy"] as const).flatMap((apiId) =>
      listEndpoints(getApi(apiId)!)
        .filter((e) => e.method === "GET" && e.operationClass === "read")
        .map((e) => `${apiId}/${e.id}`)
        .filter((id) => !BLOCKED.has(id)),
    );
    expect(listLiveTargetIds().sort()).toEqual([...new Set([...reads, ...STRICT])].sort());
    expect(listLiveTargetIds()).toHaveLength(85);
  });

  it("never includes a write, a Proxy action, a blocked operation", () => {
    for (const id of listLiveTargetIds()) {
      const [apiId, endpointId] = id.split("/");
      const e = getEndpoint(apiId, endpointId)!;
      expect(e.method, id).toBe("GET");
      if (STRICT.includes(id)) expect(e.operationClass, id).not.toBe("write");
      else expect(e.operationClass, id).toBe("read");
      expect(BLOCKED.has(id), id).toBe(false);
    }
    for (const id of ["openapi/dial", "proxy/dial", "proxy/hangup", "proxy/reboot", "proxy/sms", "openapi/queues-create"]) {
      expect(listLiveTargetIds(), id).not.toContain(id);
    }
  });

  it("keeps the four strict field-allowlist policies; everything else is pass-through", () => {
    const strict = listLiveTargetIds().filter((id) => getLiveTarget(id)!.projection === "fields");
    expect(strict.sort()).toEqual(STRICT);
  });

  it.each(["proxy/info-voicemail", "proxy/cdr-update", "openapi/aianalysis-get", "proxy/INFO-AGENTS", "proxy/info-agents "])(
    "does not allow %s",
    (endpoint) => {
      expect(validateLiveRequest({ ...agents, endpoint })).toEqual({ ok: false, code: "endpoint_not_allowed" });
    },
  );
});

describe("info-agents target", () => {
  const t = getLiveTarget("proxy/info-agents")!;

  it("is resolved from content with fixed operation selectors", () => {
    expect(t).toMatchObject({
      origin: "https://pbx6webserver.1com.co.il",
      path: "/pbx/proxyapi.php",
      method: "GET",
      fixedQuery: { reqtype: "INFO", info: "agents" },
      credential: { location: "query", name: "key" },
    });
    expect([...t.allowedParams].sort()).toEqual(["format", "queue", "tenant"]);
    expect([...t.paramEnums.get("format")!].sort()).toEqual(["json", "plain"]);
  });

  it("builds the upstream URL from the target only", () => {
    const r = validateLiveRequest(agents);
    if (!r.ok) throw new Error("fixture invalid");
    expect([...buildUpstreamUrl(r.value).searchParams.keys()]).toEqual(["reqtype", "info", "tenant", "queue", "key"]);
  });

  it.each(["0", "281", "999999"])("accepts queue=%s", (queue) => {
    expect(validateLiveRequest({ ...agents, params: { tenant: TENANT, queue } }).ok).toBe(true);
  });

  it("treats queue as optional", () => {
    expect(validateLiveRequest({ ...agents, params: { tenant: TENANT } }).ok).toBe(true);
  });

  it.each(["-1", "2 81", "281a", "1e3", "0x10", "２８１", "281\n", "281&info=DIDS", "all"])("rejects queue=%j", (queue) => {
    expect(validateLiveRequest({ ...agents, params: { tenant: TENANT, queue } })).toEqual({ ok: false, code: "invalid_request" });
  });

  it.each([
    ["reqtype", "MANAGEDB"],
    ["info", "EXTENSIONS"],
    ["action", "PAUSE"],
    ["extension", "104-x"],
    ["key", "x"],
  ])("rejects caller-set %s", (name, value) => {
    expect(validateLiveRequest({ ...agents, params: { tenant: TENANT, [name]: value } })).toEqual({ ok: false, code: "invalid_request" });
  });

  it("the JSON field allowlist matches the documented record schema exactly", () => {
    const documented = getEndpoint("proxy", "info-agents")!.responses[0].schema![0].children!.map((c) => c.name).sort();
    expect([...t.jsonFields].sort()).toEqual(documented);
  });
});

describe("cdr-get target", () => {
  const t = getLiveTarget("proxy/cdr-get")!;

  it("fixes field=userfield and offers no format", () => {
    expect(t.fixedQuery).toEqual({ reqtype: "CDR", action: "GET", field: "userfield" });
    expect([...t.allowedParams].sort()).toEqual(["tenant", "uniqueid"]);
    expect(t.jsonFields.size).toBe(0);
  });

  it.each(["PBX-1701011773.4670", "pbx99-1790000000.1234567", "1701011773.4670", "a_b-1.2"])("accepts uniqueid=%s", (uniqueid) => {
    expect(validateLiveRequest({ ...cdr, params: { tenant: TENANT, uniqueid } }).ok).toBe(true);
  });

  it.each([
    "zzz",
    "1701011773",
    "PBX-1701011773.",
    ".4670",
    "srv-02-1701011773.4670",
    "PBX-1701011773.4670.1",
    "PBX 1701011773.4670",
    "PBX-1701011773.4670&field=src",
    "' OR 1=1",
  ])("rejects uniqueid=%j", (uniqueid) => {
    expect(validateLiveRequest({ ...cdr, params: { tenant: TENANT, uniqueid } })).toEqual({ ok: false, code: "invalid_request" });
  });

  it.each([
    ["field", "src"],
    ["field", "userfield"],
    ["action", "UPDATE"],
    ["value", ""],
    ["reqtype", "INFO"],
    ["format", "json"],
    ["key", "x"],
  ])("rejects caller-set %s=%j", (name, value) => {
    expect(validateLiveRequest({ ...cdr, params: { tenant: TENANT, uniqueid: UNIQUEID, [name]: value } })).toEqual({
      ok: false,
      code: "invalid_request",
    });
  });
});

describe("handler output for the new endpoints", () => {
  const record = (k: string) => ({ "0": "0", "1": "available", "2": "UNAVAILABLE", "4": "", "5": "", "6": "", "7": "", "8": "", "10": k, "11": k });

  it("info-agents: keeps the approved positions, drops any new one, never logs inputs", async () => {
    const upstream = { "201-t": { ...record("201-t"), "3": "unexpected-3", "12": "unexpected-12" } };
    const { res, env, lines } = await run({ ...agents, params: { ...agents.params, format: "json" } }, JSON.stringify(upstream));
    expect(res.status).toBe(200);
    expect(JSON.parse(env.upstream.bodyText)).toEqual({ "201-t": record("201-t") });
    expect(env.upstream.fieldsOmitted).toBe(2);
    expect(lines).toHaveLength(1);
    for (const s of [KEY, TENANT, QUEUE]) expect(lines[0]).not.toContain(s);
  });

  it("info-agents: a nonexistent queue's null body passes through as-is", async () => {
    const { env } = await run(agents, "null");
    expect(env.upstream.bodyText).toBe("null");
  });

  it("info-agents: the plain agent:State line passes through", async () => {
    const line = "201-t:Unavailable|300-t:Unavailable|";
    const { env } = await run(agents, line, "text/html");
    expect(env.upstream.bodyText).toBe(line);
  });

  it("cdr-get: returns the raw userfield text and never logs inputs", async () => {
    const { env, lines, fetch } = await run(cdr, "customer-note", "text/html");
    expect(env.upstream.bodyText).toBe("customer-note");
    const [url] = fetch.mock.calls[0] as unknown as [URL];
    expect(url.searchParams.get("field")).toBe("userfield");
    expect(url.searchParams.get("action")).toBe("GET");
    for (const s of [KEY, TENANT, UNIQUEID]) expect(lines.join("\n")).not.toContain(s);
  });

  it("cdr-get: an empty body stays empty", async () => {
    const { env } = await run(cdr, "", "text/html");
    expect(env.upstream.bodyText).toBe("");
  });

  it("cdr-get: a JSON-record userfield is cut to nothing (no approved fields)", async () => {
    const { env } = await run(cdr, JSON.stringify([{ src: "0501234567", note: "x" }]));
    expect(JSON.parse(env.upstream.bodyText)).toEqual([{}]);
    expect(env.upstream.bodyText).not.toContain("0501234567");
  });

  it("cdr-get: any other JSON-shaped userfield is withheld", async () => {
    const { env } = await run(cdr, JSON.stringify({ src: "0501234567" }));
    expect(env.upstream.bodyText).toBe(WITHHELD);
  });
});
