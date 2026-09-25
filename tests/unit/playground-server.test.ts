import { describe, expect, it, vi } from "vitest";
import { getLiveTarget } from "@/server/playground/allowlist";
import { getPlaygroundConfig, type PlaygroundConfig } from "@/server/playground/config";
import { buildUpstreamUrl, executeLive } from "@/server/playground/execute";
import { handleLiveRequest } from "@/server/playground/handler";
import { clientKey, createMemoryRateLimiter } from "@/server/playground/rate-limit";
import { validateLiveRequest } from "@/server/playground/validate";

// Obviously fake values; the tests assert neither ever leaks.
const KEY = "TEST_KEY_do_not_leak_5f3a";
const TENANT = "TEST_TENANT_7c1e";
const ORIGIN = "http://localhost:3000";

const validBody = { endpoint: "proxy/info-extensions", params: { tenant: TENANT }, credential: KEY };

function config(overrides: Partial<PlaygroundConfig> = {}): PlaygroundConfig {
  return { ...getPlaygroundConfig({ PLAYGROUND_LIVE_ENABLED: "true" }), ...overrides };
}

function post(body: unknown, headers: Record<string, string> = {}) {
  return new Request(`${ORIGIN}/api/playground`, {
    method: "POST",
    headers: {
      host: "localhost:3000",
      origin: ORIGIN,
      "sec-fetch-site": "same-origin",
      "content-type": "application/json",
      ...headers,
    },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

function jsonFetch(body: unknown, init: ResponseInit = { status: 200 }) {
  return vi.fn(async () => new Response(JSON.stringify(body), { headers: { "content-type": "application/json" }, ...init }));
}

describe("config", () => {
  it("is off by default and clamps limits to hard ceilings", () => {
    const c = getPlaygroundConfig({
      PLAYGROUND_REQUEST_TIMEOUT_MS: "999999",
      PLAYGROUND_MAX_RESPONSE_BYTES: "999999999",
      PLAYGROUND_RATE_LIMIT: "0",
    });
    expect(c.liveEnabled).toBe(false);
    expect(c.timeoutMs).toBe(30_000);
    expect(c.maxResponseBytes).toBe(5_242_880);
    expect(c.rateLimitPerMinute).toBe(1);
  });

  it("only enables on the exact string true and ignores malformed values", () => {
    expect(getPlaygroundConfig({ PLAYGROUND_LIVE_ENABLED: "1" }).liveEnabled).toBe(false);
    expect(getPlaygroundConfig({ PLAYGROUND_REQUEST_TIMEOUT_MS: "5e3" }).timeoutMs).toBe(10_000);
    expect(getPlaygroundConfig({ PLAYGROUND_TRUSTED_IP_HEADER: "bad header" }).trustedIpHeader).toBeNull();
  });
});

describe("allowlist", () => {
  it("contains exactly the approved endpoint, resolved from content", () => {
    const t = getLiveTarget("proxy/info-extensions");
    expect(t).toMatchObject({
      origin: "https://pbx6webserver.1com.co.il",
      path: "/pbx/proxyapi.php",
      method: "GET",
      fixedQuery: { reqtype: "INFO", info: "EXTENSIONS" },
      credentialParam: "key",
    });
    expect([...t!.allowedParams].sort()).toEqual(["id", "number", "tenant"]);
    expect(getLiveTarget("sample/list-calls")).toBeUndefined();
    expect(getLiveTarget("__proto__")).toBeUndefined();
  });
});

describe("validateLiveRequest", () => {
  it("accepts a valid request and drops empty params", () => {
    const r = validateLiveRequest({ ...validBody, params: { tenant: TENANT, id: "", number: "  " } });
    expect(r.ok && r.value.params).toEqual({ tenant: TENANT });
  });

  it.each([
    ["non-object", "x"],
    ["array", []],
    ["unknown top-level field", { ...validBody, targetUrl: "https://evil.test" }],
    ["fixed-query override", { ...validBody, params: { reqtype: "MANAGEDB" } }],
    ["operation override", { ...validBody, params: { info: "DIDS" } }],
    ["credential smuggled as param", { ...validBody, params: { key: "x" } }],
    ["unknown param", { ...validBody, params: { filter: "1=1" } }],
    ["non-string param", { ...validBody, params: { tenant: 1 } }],
    ["oversized param", { ...validBody, params: { tenant: "a".repeat(129) } }],
    ["control char in param", { ...validBody, params: { tenant: "a\r\nb" } }],
    ["control char in credential", { ...validBody, credential: "a\u0000" }],
    ["oversized credential", { ...validBody, credential: "k".repeat(257) }],
  ])("rejects %s", (_label, input) => {
    expect(validateLiveRequest(input)).toEqual({ ok: false, code: "invalid_request" });
  });

  it("distinguishes a non-allowlisted endpoint and a missing credential", () => {
    expect(validateLiveRequest({ ...validBody, endpoint: "proxy/managedb" })).toEqual({ ok: false, code: "endpoint_not_allowed" });
    expect(validateLiveRequest({ ...validBody, credential: "" })).toEqual({ ok: false, code: "missing_credential" });
    expect(validateLiveRequest({ endpoint: validBody.endpoint, params: {} })).toEqual({ ok: false, code: "missing_credential" });
  });
});

describe("executeLive", () => {
  const request = () => {
    const r = validateLiveRequest(validBody);
    if (!r.ok) throw new Error("fixture invalid");
    return r.value;
  };
  const opts = { timeoutMs: 1_000, maxResponseBytes: 1_024 };

  it("builds the URL only from the allowlisted target", () => {
    const url = buildUpstreamUrl(request());
    expect(url.origin).toBe("https://pbx6webserver.1com.co.il");
    expect(url.pathname).toBe("/pbx/proxyapi.php");
    expect([...url.searchParams.keys()]).toEqual(["reqtype", "info", "tenant", "key"]);
  });

  it("returns status, size and only exposed headers", async () => {
    const fetch = vi.fn(
      async () =>
        new Response('{"1":{"ex_id":"1"}}', {
          status: 200,
          headers: { "content-type": "application/json", "set-cookie": "s=1", server: "Apache/2" },
        }),
    );
    const r = await executeLive(request(), { ...opts, fetch });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.upstream.status).toBe(200);
    expect(r.upstream.sizeBytes).toBe(19);
    expect(r.upstream.headers).toEqual({ "content-type": "application/json" });
    const [, init] = fetch.mock.calls[0] as unknown as [URL, RequestInit];
    expect(init.redirect).toBe("manual");
    expect(init.method).toBe("GET");
  });

  it("passes non-2xx upstream statuses through as data", async () => {
    const r = await executeLive(request(), { ...opts, fetch: jsonFetch({ error: "x" }, { status: 401 }) });
    expect(r.ok && r.upstream.status).toBe(401);
  });

  it("never follows redirects", async () => {
    const fetch = vi.fn(async () => new Response(null, { status: 302, headers: { location: "https://evil.test/" } }));
    expect(await executeLive(request(), { ...opts, fetch })).toMatchObject({ ok: false, code: "upstream_redirect" });
  });

  it("enforces the response-size ceiling on declared and streamed bodies", async () => {
    const declared = vi.fn(async () => new Response("x", { headers: { "content-length": "999999" } }));
    expect(await executeLive(request(), { ...opts, fetch: declared })).toMatchObject({ code: "upstream_too_large" });
    const streamed = vi.fn(async () => new Response("x".repeat(2_000)));
    expect(await executeLive(request(), { ...opts, fetch: streamed })).toMatchObject({ code: "upstream_too_large" });
  });

  it("times out", async () => {
    const fetch = vi.fn(
      (_url: URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => reject(init.signal?.reason));
        }),
    );
    const r = await executeLive(request(), { ...opts, timeoutMs: 20, fetch: fetch as unknown as typeof globalThis.fetch });
    expect(r).toMatchObject({ ok: false, code: "upstream_timeout" });
  });

  it("maps network errors to a fixed code, discarding a message that contains the URL", async () => {
    const fetch = vi.fn(async (url: URL) => {
      throw new TypeError(`fetch failed: ${url.toString()}`);
    });
    const r = await executeLive(request(), { ...opts, fetch: fetch as unknown as typeof globalThis.fetch });
    expect(r).toMatchObject({ ok: false, code: "upstream_unreachable" });
    expect(JSON.stringify(r)).not.toContain(KEY);
  });
});

describe("rate limiter", () => {
  it("allows the limit per window, then reports retry-after", () => {
    let t = 0;
    const rl = createMemoryRateLimiter({ limit: 2, windowMs: 60_000, now: () => t });
    expect(rl.consume("a").allowed).toBe(true);
    expect(rl.consume("a").allowed).toBe(true);
    expect(rl.consume("a")).toEqual({ allowed: false, retryAfterSeconds: 60 });
    expect(rl.consume("b").allowed).toBe(true);
    t = 60_000;
    expect(rl.consume("a").allowed).toBe(true);
  });

  it("stays bounded in memory", () => {
    const rl = createMemoryRateLimiter({ limit: 1, windowMs: 60_000, maxKeys: 2, now: () => 0 });
    rl.consume("a");
    rl.consume("b");
    rl.consume("c"); // evicts "a"
    expect(rl.consume("a").allowed).toBe(true);
  });

  it("reads only the trusted header, right-most entry", () => {
    const h = new Headers({ "x-forwarded-for": "6.6.6.6, 10.0.0.1" });
    expect(clientKey(h, null)).toBe("global");
    expect(clientKey(h, "x-forwarded-for")).toBe("ip:10.0.0.1");
    expect(clientKey(new Headers(), "x-real-ip")).toBe("unknown");
  });
});

describe("handleLiveRequest", () => {
  const deps = (overrides: Partial<Parameters<typeof handleLiveRequest>[1]> = {}) => {
    const lines: string[] = [];
    return {
      lines,
      deps: {
        config: config(),
        limiter: createMemoryRateLimiter({ limit: 100, windowMs: 60_000 }),
        fetch: jsonFetch({ "1": { ex_id: "1" } }),
        log: (l: string) => lines.push(l),
        ...overrides,
      },
    };
  };

  async function code(res: Response) {
    return ((await res.json()) as { error?: { code: string } }).error?.code;
  }

  it("is disabled unless explicitly enabled", async () => {
    const { deps: d } = deps({ config: getPlaygroundConfig({}) });
    const res = await handleLiveRequest(post(validBody), d);
    expect(res.status).toBe(503);
    expect(await code(res)).toBe("live_disabled");
    expect(d.fetch).not.toHaveBeenCalled();
  });

  it.each([
    ["foreign Origin", { origin: "https://evil.test" }],
    ["cross-site fetch metadata", { "sec-fetch-site": "cross-site" }],
    ["missing Origin", { origin: "" }],
  ])("rejects %s", async (_label, headers) => {
    const { deps: d } = deps();
    const res = await handleLiveRequest(post(validBody, headers), d);
    expect(res.status).toBe(403);
    expect(d.fetch).not.toHaveBeenCalled();
  });

  it("requires JSON and caps the request body", async () => {
    const { deps: d } = deps();
    expect((await handleLiveRequest(post(validBody, { "content-type": "text/plain" }), d)).status).toBe(415);
    expect((await handleLiveRequest(post({ ...validBody, pad: "x".repeat(9_000) }), d)).status).toBe(413);
    expect((await handleLiveRequest(post("{not json"), d)).status).toBe(400);
  });

  it("rate-limits before touching upstream", async () => {
    const { deps: d } = deps({ limiter: createMemoryRateLimiter({ limit: 1, windowMs: 60_000 }) });
    expect((await handleLiveRequest(post(validBody), d)).status).toBe(200);
    const res = await handleLiveRequest(post(validBody), d);
    expect(res.status).toBe(429);
    expect(res.headers.get("retry-after")).toBe("60");
    expect(d.fetch).toHaveBeenCalledTimes(1);
  });

  it("returns the upstream response with no-store and never leaks key or tenant into logs", async () => {
    const { deps: d, lines } = deps();
    const res = await handleLiveRequest(post(validBody), d);
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    const body = (await res.json()) as { ok: boolean; upstream: { status: number; bodyText: string } };
    expect(body.ok).toBe(true);
    expect(body.upstream.status).toBe(200);
    expect(lines).toHaveLength(1);
    expect(JSON.parse(lines[0])).toMatchObject({ endpoint: "proxy/info-extensions", outcome: "upstream_response", status: 200 });
    for (const l of lines) {
      expect(l).not.toContain(KEY);
      expect(l).not.toContain(TENANT);
    }
  });

  it("never leaks the credential in error responses or logs", async () => {
    const failing = vi.fn(async (url: URL) => {
      throw new Error(`connect ECONNREFUSED ${url.toString()}`);
    });
    const { deps: d, lines } = deps({ fetch: failing as unknown as typeof fetch });
    const res = await handleLiveRequest(post(validBody), d);
    expect(res.status).toBe(502);
    const text = await res.text();
    expect(text).not.toContain(KEY);
    expect(lines.join("\n")).not.toContain(KEY);
  });
});

describe("credential-leak guards outside the proxy code", () => {
  it("next.config does not enable Next's dev fetch logging (it would print the key-bearing upstream URL)", async () => {
    const { readFile } = await import("node:fs/promises");
    const source = await readFile(new URL("../../next.config.ts", import.meta.url), "utf-8");
    const code = source.replace(/\/\/.*$/gm, "");
    expect(code).not.toMatch(/fetches/);
  });

  it("an aborted request body fails closed with a fixed code", async () => {
    const body = new ReadableStream<Uint8Array>({
      pull() {
        throw new Error(`stream broke ${KEY}`);
      },
    });
    const req = new Request(`${ORIGIN}/api/playground`, {
      method: "POST",
      headers: { host: "localhost:3000", origin: ORIGIN, "content-type": "application/json" },
      body,
      duplex: "half",
    } as RequestInit);
    const res = await handleLiveRequest(req, {
      config: config(),
      limiter: createMemoryRateLimiter({ limit: 100, windowMs: 60_000 }),
      log: () => {},
    });
    expect(res.status).toBe(400);
    expect(await res.text()).not.toContain(KEY);
  });
});
