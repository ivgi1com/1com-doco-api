import { describe, expect, it } from "vitest";
import { proxyApi } from "@/content/proxy-api";
import { sampleApi } from "@/content/sample-api";
import { getEndpoint } from "@/content";
import type { Endpoint } from "@/content/types";
import {
  API_KEY_ENV,
  buildSample,
  exampleQuery,
  resolvePath,
} from "@/lib/code-samples";

const listCalls = getEndpoint("sample", "list-call-records")!;
const getCall = getEndpoint("sample", "get-call-record")!;
const createContact = getEndpoint("sample", "create-contact")!;
const deleteContact = getEndpoint("sample", "delete-contact")!;
const infoExtensions = getEndpoint("proxy", "info-extensions")!;

describe("resolvePath", () => {
  it("substitutes path parameters with their example values", () => {
    expect(resolvePath(getCall)).toBe("/v1/call-records/call_0001");
  });

  it("leaves paths untouched when there are no path parameters", () => {
    expect(resolvePath(listCalls)).toBe("/v1/call-records");
  });

  it("substitutes every occurrence of a path parameter that appears more than once", () => {
    const endpoint: Endpoint = {
      ...getCall,
      path: "/v1/{call_id}/related/{call_id}",
    };
    expect(resolvePath(endpoint)).toBe("/v1/call_0001/related/call_0001");
  });
});

describe("exampleQuery", () => {
  it("builds a query string only from parameters with an example value", () => {
    // list-call-records: only from_date and limit have `example` set.
    expect(exampleQuery(listCalls)).toBe(
      "?from_date=2026-09-01T00%3A00%3A00Z&limit=25",
    );
  });

  it("returns an empty string when no query parameters have examples", () => {
    expect(exampleQuery(getCall)).toBe("");
  });
});

describe("buildSample", () => {
  const baseUrl = sampleApi.baseUrl;

  it("never embeds a realistic-looking secret", () => {
    for (const lang of ["curl", "javascript", "python"] as const) {
      const sample = buildSample(listCalls, baseUrl, lang);
      expect(sample).toContain(API_KEY_ENV);
      expect(sample).not.toMatch(/sk_live|sk_test|Bearer [A-Za-z0-9]{16,}/);
    }
  });

  it("includes a request body for endpoints that have one (curl)", () => {
    const sample = buildSample(createContact, baseUrl, "curl");
    expect(sample).toContain("-d '");
    expect(sample).toContain('"phone":"+15555550142"');
  });

  it("omits the body block for endpoints without a request body (curl)", () => {
    const sample = buildSample(deleteContact, baseUrl, "curl");
    expect(sample).not.toContain("-d '");
    expect(sample).not.toContain("Content-Type");
  });

  it("handles a 204 response without parsing a body (javascript)", () => {
    const sample = buildSample(deleteContact, baseUrl, "javascript");
    expect(sample).toContain("console.log(response.status)");
    expect(sample).not.toContain("response.json()");
  });

  it("emits Python-literal booleans/None instead of JSON true/false/null (python)", () => {
    const sample = buildSample(createContact, baseUrl, "python");
    expect(sample).toContain('json={"name"');
    expect(sample).not.toMatch(/\btrue\b|\bfalse\b|\bnull\b/);
  });

  it("joins curl request lines with a real line break, not a literal backslash-n", () => {
    const sample = buildSample(createContact, baseUrl, "curl");
    expect(sample).not.toContain("\\n"); // the literal two-character sequence
    expect(sample.split("\n").length).toBeGreaterThan(1);
  });

  it("does not turn a string body value equal to true/false/null into a Python literal (python)", () => {
    const endpoint: Endpoint = {
      ...createContact,
      requestExample: { name: "Dana Levi", flag: "true" },
    };
    const sample = buildSample(endpoint, baseUrl, "python");
    expect(sample).toContain('"flag": "true"');
    expect(sample).not.toContain('"flag": True');
  });
});

describe("buildSample: query-parameter auth (Proxy API)", () => {
  const baseUrl = proxyApi.baseUrl;

  it("never inlines a literal key value, only the env var name (curl)", () => {
    const sample = buildSample(infoExtensions, baseUrl, "curl");
    expect(sample).toContain("PROXY_API_KEY");
    expect(sample).not.toMatch(/key=(?!\$PROXY_API_KEY)\S/);
  });

  it("sends the key and fixed query as -G/--data-urlencode pairs, not an Authorization header (curl)", () => {
    const sample = buildSample(infoExtensions, baseUrl, "curl");
    expect(sample).toContain(`curl -G "${baseUrl}${infoExtensions.path}"`);
    expect(sample).toContain('--data-urlencode "key=$PROXY_API_KEY"');
    expect(sample).toContain('--data-urlencode "reqtype=INFO"');
    expect(sample).toContain('--data-urlencode "info=EXTENSIONS"');
    expect(sample).toContain('--data-urlencode "tenant=TENANTCODE"');
    expect(sample).not.toContain("Authorization");
  });

  it("builds a URLSearchParams object from process.env, not a literal secret (javascript)", () => {
    const sample = buildSample(infoExtensions, baseUrl, "javascript");
    expect(sample).toContain("new URLSearchParams({");
    expect(sample).toContain("process.env.PROXY_API_KEY");
    expect(sample).toContain('"reqtype": "INFO"');
    expect(sample).toContain('"info": "EXTENSIONS"');
  });

  it("passes params to requests.get and reads the key from os.environ (python)", () => {
    const sample = buildSample(infoExtensions, baseUrl, "python");
    expect(sample).toContain("requests.get(");
    expect(sample).toContain('os.environ["PROXY_API_KEY"]');
    expect(sample).toContain('"reqtype": "INFO"');
    expect(sample).toContain('"info": "EXTENSIONS"');
  });

  it("still emits the original header-based samples unchanged for a header-auth endpoint", () => {
    // Regression guard: adding the query-auth branch must not change the
    // Sample API's Authorization-header output.
    const sample = buildSample(listCalls, sampleApi.baseUrl, "curl");
    expect(sample).toContain('-H "Authorization: Bearer $SAMPLE_API_KEY"');
    expect(sample).not.toContain("-G");
  });
});
