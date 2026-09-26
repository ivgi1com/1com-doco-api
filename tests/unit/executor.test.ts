import { afterEach, describe, expect, it, vi } from "vitest";
import { getApi, getEndpoint } from "@/content";
import { getDemoFixtures } from "@/content/demo";
import { proxyApi } from "@/content/proxy";
import { sampleApi } from "@/content/sample-api";
import {
  curlEquivalent,
  demoProvider,
  liveProvider,
  liveQueryParams,
  MASK,
  sanitizedRequest,
} from "@/components/playground/executor";
import { LIVE_ROUTE } from "@/lib/playground-protocol";

const KEY = "TEST_KEY_do_not_leak_9d2f";
const infoExtensions = getEndpoint("proxy", "info-extensions")!;
const infoAgents = getEndpoint("proxy", "info-agents")!;
const cdrGet = getEndpoint("proxy", "cdr-get")!;
const listCalls = getEndpoint("sample", "list-call-records")!;
const openapiApi = getApi("openapi")!;
const campaignsGet = getEndpoint("openapi", "campaigns-get")!;

const fieldValues = { "query:tenant": "ACME", "query:id": "", "query:number": "  " };

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("liveQueryParams", () => {
  it("keeps only non-empty query values", () => {
    expect(liveQueryParams(infoExtensions, fieldValues)).toEqual({ tenant: "ACME" });
  });
});

describe("sanitizedRequest", () => {
  it("masks the query-auth credential and keeps fixed selectors", () => {
    const r = sanitizedRequest(proxyApi, infoExtensions, fieldValues);
    expect(r.method).toBe("GET");
    expect(r.url).toBe(
      `https://pbx6webserver.1com.co.il/pbx/proxyapi.php?reqtype=INFO&info=EXTENSIONS&tenant=ACME&key=${MASK}`,
    );
  });

  it("never includes the actual credential, only the mask", () => {
    const r = sanitizedRequest(proxyApi, infoExtensions, fieldValues);
    expect(r.url).not.toContain(KEY);
  });
});

describe("sanitizedRequest (header-auth REST API)", () => {
  it("substitutes path parameters and shows the masked X-API-Key header, never the key", () => {
    const r = sanitizedRequest(openapiApi, campaignsGet, { "path:ca_id": "44", "query:tenant": "TESTTENANT" });
    expect(r.url).toBe(`${openapiApi.baseUrl}/campaigns/44?tenant=TESTTENANT`);
    expect(r.headers).toEqual({ "X-API-Key": MASK });
    expect(JSON.stringify(r)).not.toContain(KEY);
    expect(curlEquivalent(r, "OPENAPI_API_KEY")).toBe(
      `curl "${openapiApi.baseUrl}/campaigns/44?tenant=TESTTENANT" -H "X-API-Key: $OPENAPI_API_KEY"`,
    );
  });

  it("keeps the placeholder for an empty path parameter", () => {
    expect(sanitizedRequest(openapiApi, campaignsGet, {}).url).toBe(`${openapiApi.baseUrl}/campaigns/{ca_id}`);
  });
});

describe("curlEquivalent", () => {
  it("swaps the mask for the endpoint's env var, unquoted", () => {
    const r = sanitizedRequest(proxyApi, infoExtensions, fieldValues);
    expect(curlEquivalent(r, "PROXY_API_KEY")).toBe(
      `curl "https://pbx6webserver.1com.co.il/pbx/proxyapi.php?reqtype=INFO&info=EXTENSIONS&tenant=ACME&key=$PROXY_API_KEY"`,
    );
  });
});

describe("liveProvider", () => {
  it("posts the credential only in the request body, never the URL", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          ok: true,
          upstream: {
            status: 200,
            latencyMs: 42,
            sizeBytes: 10,
            contentType: "application/json",
            headers: { "content-type": "application/json" },
            bodyText: '{"1":{"ex_id":"1"}}',
          },
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await liveProvider.execute(
      { api: proxyApi, endpoint: infoExtensions, fieldValues, credential: KEY, simulateError: false },
      new AbortController().signal,
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(LIVE_ROUTE);
    expect(String(init.body)).toContain(KEY);
    expect(url).not.toContain(KEY);

    expect(result).toMatchObject({ source: "LIVE", kind: "response", status: 200, format: "json" });
    if (result.source === "LIVE" && result.kind === "response") {
      expect(result.body).toEqual({ "1": { ex_id: "1" } });
      expect(result.request.url).not.toContain(KEY);
    }
  });

  it("maps a portal error envelope to a portal-error result with retry-after", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ ok: false, error: { code: "rate_limited" } }), {
            status: 429,
            headers: { "retry-after": "30" },
          }),
      ),
    );
    const result = await liveProvider.execute(
      { api: proxyApi, endpoint: infoExtensions, fieldValues, credential: KEY, simulateError: false },
      new AbortController().signal,
    );
    expect(result).toMatchObject({ source: "LIVE", kind: "portal-error", code: "rate_limited", retryAfterSeconds: 30 });
  });

  it("treats a network failure as portal_unreachable, not a thrown error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("network down");
      }),
    );
    const result = await liveProvider.execute(
      { api: proxyApi, endpoint: infoExtensions, fieldValues, credential: KEY, simulateError: false },
      new AbortController().signal,
    );
    expect(result).toMatchObject({ source: "LIVE", kind: "portal-error", code: "portal_unreachable" });
  });

  it("treats a malformed JSON body as invalid_portal_response", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("not json", { status: 200 })));
    const result = await liveProvider.execute(
      { api: proxyApi, endpoint: infoExtensions, fieldValues, credential: KEY, simulateError: false },
      new AbortController().signal,
    );
    expect(result).toMatchObject({ source: "LIVE", kind: "portal-error", code: "invalid_portal_response" });
  });
});

describe("demoProvider", () => {
  it("never makes a network request", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await demoProvider.execute(
      { api: sampleApi, endpoint: listCalls, fieldValues: {}, credential: "", simulateError: false },
      new AbortController().signal,
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("never makes a network request for any OpenAPI endpoint, fixtured, fixture-less, or write", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const ids = ["extensions-state-get", "ailogs-list", "aianalysis-get", "cdrs-list", "campaigns-delete"];
    for (const id of ids) {
      const endpoint = getEndpoint("openapi", id)!;
      const preset = getDemoFixtures("openapi", id)?.cases[0].preset ?? {};
      const fieldValues = Object.fromEntries(Object.entries(preset).map(([k, v]) => [`query:${k}`, v]));
      await demoProvider.execute(
        { api: openapiApi, endpoint, fieldValues, credential: KEY, simulateError: false },
        new AbortController().signal,
      );
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reports unavailable for a non-synthetic API endpoint with no fixture set", async () => {
    // cdr-get has no Demo fixture set (out of the Phase 6 scope decided by
    // the user) and proxyApi.synthetic is false, so this must fall through
    // to unavailable rather than fabricating a response.
    const result = await demoProvider.execute(
      { api: proxyApi, endpoint: cdrGet, fieldValues: {}, credential: "", simulateError: false },
      new AbortController().signal,
    );
    expect(result).toEqual({ source: "DEMO", unavailable: true });
  });

  it("never answers a write operation, even one whose API or endpoint would otherwise have Demo data", async () => {
    // info-extensions has a fixture set and the Sample API is synthetic; flagged
    // as writes, neither may produce a Demo response.
    for (const [api, endpoint] of [
      [proxyApi, { ...infoExtensions, operationClass: "write" as const }],
      [sampleApi, { ...listCalls, operationClass: "write" as const }],
    ] as const) {
      const result = await demoProvider.execute(
        { api, endpoint, fieldValues: { "query:tenant": "EXAMPLE", "query:format": "json" }, credential: "", simulateError: false },
        new AbortController().signal,
      );
      expect(result).toEqual({ source: "DEMO", unavailable: true });
    }
  });

  it("returns a synthetic success response for the synthetic Sample API", async () => {
    const result = await demoProvider.execute(
      { api: sampleApi, endpoint: listCalls, fieldValues: {}, credential: "", simulateError: false },
      new AbortController().signal,
    );
    expect(result.source).toBe("DEMO");
    if (result.source === "DEMO" && !result.unavailable && !result.notSimulated) {
      expect(result.status).toBeLessThan(300);
      expect(result.format).toBe("json");
      expect(result.request.url).toContain(sampleApi.baseUrl);
    }
  });

  it("resolves a fixture case for a non-synthetic API endpoint that has one", async () => {
    const result = await demoProvider.execute(
      {
        api: proxyApi,
        endpoint: infoExtensions,
        fieldValues: { "query:tenant": "EXAMPLE", "query:id": "", "query:number": "", "query:format": "json" },
        credential: "",
        simulateError: false,
      },
      new AbortController().signal,
    );
    expect(result.source).toBe("DEMO");
    if (result.source === "DEMO" && !result.unavailable && !result.notSimulated) {
      expect(result.status).toBe(200);
      expect(result.format).toBe("json");
      expect(result.caseLabel).toBeTruthy();
      expect(Array.isArray(result.body)).toBe(true);
    } else {
      throw new Error("expected a resolved fixture case");
    }
  });

  it("reports notSimulated for an input combination no fixture case covers", async () => {
    const result = await demoProvider.execute(
      {
        api: proxyApi,
        endpoint: infoAgents,
        fieldValues: { "query:tenant": "EXAMPLE", "query:queue": "281", "query:format": "csv" },
        credential: "",
        simulateError: false,
      },
      new AbortController().signal,
    );
    expect(result).toMatchObject({ source: "DEMO", notSimulated: true });
  });
});
