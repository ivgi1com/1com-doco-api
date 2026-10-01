import { afterEach, describe, expect, it, vi } from "vitest";
import { getApi, getEndpoint } from "@/content";
import { getDemoFixtures, isDemoSimulatedWrite } from "@/content/demo";
import { proxyApi } from "@/content/proxy";
import { sampleApi } from "@/content/sample-api";
import {
  BODY_SECRET_MASK,
  bodyDisplay,
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

describe("request bodies (Phase 8C)", () => {
  const queuesCreate = getEndpoint("openapi", "campaigns-create")!; // has string, integer and array body fields
  const body = (values: Record<string, string>) => sanitizedRequest(openapiApi, queuesCreate, values);
  const bodyFields = queuesCreate.requestBody ?? [];
  const named = (type: string) => bodyFields.find((p) => p.type === type);

  it("has no body for a GET, even with body-keyed values", () => {
    const r = sanitizedRequest(openapiApi, campaignsGet, { "body:name": "x" });
    expect(r.body).toBeUndefined();
    expect(curlEquivalent(r, "OPENAPI_API_KEY")).not.toContain(" -d ");
  });

  it("builds a JSON body from entered fields only, coercing documented types", () => {
    const str = named("string");
    const int = named("integer");
    expect(str && int).toBeTruthy();
    const r = body({ [`body:${str!.name}`]: "Support", [`body:${int!.name}`]: "7", "body:ignored": "x" });
    expect(r.body?.json).toEqual({ [str!.name]: "Support", [int!.name]: 7 });
    expect(r.headers?.["Content-Type"]).toBe("application/json");
  });

  it("omits empty fields and keeps a non-numeric integer as a string (never guessed)", () => {
    const int = named("integer")!;
    expect(body({ [`body:${int.name}`]: "  " }).body).toBeUndefined();
    expect(body({ [`body:${int.name}`]: "abc" }).body?.json).toEqual({ [int.name]: "abc" });
  });

  it("parses array/object text as JSON and keeps invalid JSON as text", () => {
    const arr = named("array")!;
    expect(body({ [`body:${arr.name}`]: '[{"a":1}]' }).body?.json).toEqual({ [arr.name]: [{ a: 1 }] });
    expect(body({ [`body:${arr.name}`]: "[{" }).body?.json).toEqual({ [arr.name]: "[{" });
  });

  it("masks secret-named body fields in the preview and the cURL, and never turns them into the API-key env var", () => {
    const ext = getEndpoint("openapi", "extensions-create")!;
    const secret = ext.requestBody!.find((p) => /pass|secret|pin/i.test(p.name))!;
    expect(secret).toBeDefined();
    const r = sanitizedRequest(openapiApi, ext, { [`body:${secret.name}`]: "hunter2-REAL" });
    const curl = curlEquivalent(r, "OPENAPI_API_KEY");
    expect(JSON.stringify(r)).not.toContain("hunter2-REAL");
    expect(curl).not.toContain("hunter2-REAL");
    expect(bodyDisplay(r.body!)).toContain(BODY_SECRET_MASK);
    // Only the header credential becomes the env var; the body secret does not.
    expect(curl.match(/\$OPENAPI_API_KEY/g)).toHaveLength(1);
  });

  it("renders a JSON body in cURL with a Content-Type header and single-quote escaping", () => {
    const str = named("string")!;
    const curl = curlEquivalent(body({ [`body:${str.name}`]: "O'Brien" }), "OPENAPI_API_KEY");
    expect(curl).toContain("-X POST");
    expect(curl).toContain('-H "Content-Type: application/json"');
    // Shell single-quote escaping: ' becomes '\''
    expect(curl).toContain("-d '{\"" + str.name + "\":\"O'\\''Brien\"}'");
  });

  it("sends a form-json-field body as --data-urlencode without a JSON Content-Type", () => {
    const add = getEndpoint("proxy", "managedb-custom-add")!;
    const field = add.requestBody![0];
    const r = sanitizedRequest(proxyApi, add, { [`body:${field.name}`]: "v" });
    const curl = curlEquivalent(r, "PROXY_API_KEY");
    expect(r.body?.formField).toBe("jsondata");
    expect(curl).toContain("--data-urlencode 'jsondata=");
    expect(curl).not.toContain("Content-Type: application/json");
  });

  it("shows the request, body included, for an unavailable Demo result and never fetches", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const str = named("string")!;
    const result = await demoProvider.execute(
      { api: openapiApi, endpoint: queuesCreate, fieldValues: { [`body:${str.name}`]: "Support" }, credential: KEY, simulateError: false },
      new AbortController().signal,
    );
    expect(result).toMatchObject({ source: "DEMO", unavailable: true });
    expect(result).toHaveProperty("request.body.json", { [str.name]: "Support" });
    expect(JSON.stringify(result)).not.toContain(KEY);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("never puts a body in the Live portal request (the protocol has no body field)", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const str = named("string")!;
    await liveProvider.execute(
      { api: openapiApi, endpoint: queuesCreate, fieldValues: { [`body:${str.name}`]: "Support" }, credential: KEY, simulateError: false },
      new AbortController().signal,
    );
    expect(fetchMock).not.toHaveBeenCalled(); // a write is refused before any request
  });
});

describe("liveProvider and writes", () => {
  it("never sends a write, for any API, even a Live-allowlisted id (SEC-REQ-27)", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    for (const [api, endpoint] of [
      [proxyApi, { ...infoExtensions, operationClass: "write" as const }],
      [openapiApi, getEndpoint("openapi", "campaigns-delete")!],
      [openapiApi, getEndpoint("openapi", "dial")!],
    ] as const) {
      const result = await liveProvider.execute(
        { api, endpoint, fieldValues: { "query:tenant": "EXAMPLE" }, credential: KEY, simulateError: false },
        new AbortController().signal,
      );
      expect(result).toMatchObject({ source: "LIVE", kind: "portal-error", code: "endpoint_not_allowed" });
      expect(JSON.stringify(result)).not.toContain(KEY);
    }
    expect(fetchMock).not.toHaveBeenCalled();
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
    expect(result).toMatchObject({ source: "DEMO", unavailable: true });
    // The request it would have made is still shown (Phase 8C), credential masked.
    expect(result).toHaveProperty("request.url", expect.stringContaining(MASK));
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
      expect(result).toMatchObject({ source: "DEMO", unavailable: true });
      expect(result).toHaveProperty("request.method");
    }
  });

  it("answers an OpenAPI write from its fixture set without any network request (SEC-REQ-27, amended)", async () => {
    // No write fixture exists yet (Phase 8C Stage 2); a fixtured read flagged
    // as a write stands in, which is exactly the path a write fixture takes.
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const id = "extensions-state-get";
    const endpoint = { ...getEndpoint("openapi", id)!, operationClass: "write" as const };
    expect(isDemoSimulatedWrite("openapi", endpoint)).toBe(true);
    const preset = getDemoFixtures("openapi", id)!.cases[0].preset;
    const values = Object.fromEntries(Object.entries(preset).map(([k, v]) => [`query:${k}`, v]));
    const result = await demoProvider.execute(
      { api: openapiApi, endpoint, fieldValues: values, credential: KEY, simulateError: false },
      new AbortController().signal,
    );
    expect(result.source).toBe("DEMO");
    expect("unavailable" in result && result.unavailable).toBeFalsy();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(JSON.stringify(result)).not.toContain(KEY);
  });

  it("keeps a write Reference-only on an API outside DEMO_WRITE_APIS, even with a fixture set", () => {
    expect(isDemoSimulatedWrite("proxy", { ...infoExtensions, operationClass: "write" })).toBe(false);
    expect(isDemoSimulatedWrite("openapi", getEndpoint("openapi", "campaigns-delete")!)).toBe(false);
    expect(isDemoSimulatedWrite("openapi", getEndpoint("openapi", "extensions-state-get")!)).toBe(false);
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
