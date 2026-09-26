import { describe, expect, it } from "vitest";
import { openapiApi } from "@/content/openapi";
import { proxyApi } from "@/content/proxy";
import { sampleApi } from "@/content/sample-api";
import { getEndpoint } from "@/content";
import type { Endpoint } from "@/content/types";
import {
  API_KEY_ENV,
  authEnvVar,
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

  // Phase 7: POST bodies and format-aware response reading.
  const formPost: Endpoint = {
    ...infoExtensions,
    id: "form-post",
    method: "POST",
    fixedQuery: { reqtype: "MANAGEDB", object: "custom", action: "add" },
    queryParameters: [infoExtensions.queryParameters[0]],
    requestBodyEncoding: { kind: "form-json-field", field: "jsondata" },
    requestExample: { cu_name: "Demo O'Brien desk", cu_ct_id: 1 },
    responses: [],
  };
  const multipartPost: Endpoint = {
    ...formPost,
    id: "multipart-post",
    requestBodyEncoding: { kind: "multipart", fileField: "filename", exampleFile: "fax.pdf" },
    requestExample: undefined,
  };
  const binaryGet: Endpoint = {
    ...infoExtensions,
    responses: [{ status: 200, description: "audio", format: "binary", verified: false }],
  };

  it("POSTs a form-json-field body with the selectors kept in the query string (curl)", () => {
    const sample = buildSample(formPost, baseUrl, "curl");
    expect(sample).not.toContain("-G");
    expect(sample).toContain('--url-query "key=$PROXY_API_KEY"');
    expect(sample).toContain('--url-query "reqtype=MANAGEDB"');
    expect(sample).toContain(`--data-urlencode 'jsondata={"cu_name":"Demo O'\\''Brien desk","cu_ct_id":1}'`);
  });

  it("POSTs a form-json-field body (javascript, python)", () => {
    const js = buildSample(formPost, baseUrl, "javascript");
    expect(js).toContain('"jsondata": JSON.stringify(');
    expect(js).toContain('{ method: "POST", body }');
    const py = buildSample(formPost, baseUrl, "python");
    expect(py).toContain("import json");
    expect(py).toContain("requests.post(");
    expect(py).toContain('data={"jsondata": json.dumps({"cu_name": "Demo O\'Brien desk", "cu_ct_id": 1})}');
  });

  it("uploads a file for multipart operations", () => {
    expect(buildSample(multipartPost, baseUrl, "curl")).toContain('-F "filename=@fax.pdf"');
    const js = buildSample(multipartPost, baseUrl, "javascript");
    expect(js).toContain('import { openAsBlob } from "node:fs";');
    expect(js).toContain('body.append("filename", await openAsBlob("fax.pdf"), "fax.pdf");');
    const py = buildSample(multipartPost, baseUrl, "python");
    expect(py).toContain('with open("fax.pdf", "rb") as file:');
    expect(py).toContain('files={"filename": file},');
  });

  it("reads the body as text when the response is not JSON or undocumented", () => {
    const cdrGet = getEndpoint("proxy", "cdr-get")!;
    expect(buildSample(cdrGet, baseUrl, "javascript")).toContain("await response.text()");
    expect(buildSample(formPost, baseUrl, "python")).toContain("print(response.text)");
    expect(buildSample(infoExtensions, baseUrl, "javascript")).toContain("await response.json()");
  });

  it("saves binary responses to a file", () => {
    expect(buildSample(binaryGet, baseUrl, "curl")).toContain("--output response.bin");
    expect(buildSample(binaryGet, baseUrl, "javascript")).toContain("response.arrayBuffer()");
    expect(buildSample(binaryGet, baseUrl, "python")).toContain("out.write(response.content)");
  });

  it("still emits the original header-based samples unchanged for a header-auth endpoint", () => {
    // Regression guard: adding the query-auth branch must not change the
    // Sample API's Authorization-header output.
    const sample = buildSample(listCalls, sampleApi.baseUrl, "curl");
    expect(sample).toContain('-H "Authorization: Bearer $SAMPLE_API_KEY"');
    expect(sample).not.toContain("-G");
  });
});

describe("buildSample: named-header auth (MiRTA OpenAPI)", () => {
  const baseUrl = openapiApi.baseUrl;
  const extList = getEndpoint("openapi", "extensions-list")!;
  const extUpdate = getEndpoint("openapi", "extensions-update")!;
  const extDelete = getEndpoint("openapi", "extensions-delete")!;

  it("sends the key in the X-API-Key header, not as Bearer or a query parameter", () => {
    const curl = buildSample(extList, baseUrl, "curl");
    expect(curl).toContain(`curl -X GET "${baseUrl}/extensions?tenant=TESTTENANT"`);
    expect(curl).toContain('-H "X-API-Key: $OPENAPI_API_KEY"');
    expect(curl).not.toContain("Bearer");
    expect(curl).not.toContain("key=");
    expect(buildSample(extList, baseUrl, "javascript")).toContain('"X-API-Key": process.env.OPENAPI_API_KEY,');
    expect(buildSample(extList, baseUrl, "python")).toContain(`headers={"X-API-Key": os.environ['OPENAPI_API_KEY']},`);
  });

  it("resolves the path parameter and sends a JSON body for PATCH", () => {
    const curl = buildSample(extUpdate, baseUrl, "curl");
    expect(curl).toContain(`curl -X PATCH "${baseUrl}/extensions/OBJECT_ID?tenant=TESTTENANT"`);
    expect(curl).toContain('-H "Content-Type: application/json"');
    expect(curl).toContain(`-d '{"name":"Demo User - Desk"`);
    expect(buildSample(extUpdate, baseUrl, "python")).toContain("requests.patch(");
  });

  it("sends no body for DELETE", () => {
    const curl = buildSample(extDelete, baseUrl, "curl");
    expect(curl).toContain("curl -X DELETE");
    expect(curl).not.toContain("-d '");
  });

  it("keeps the Sample API on its own env var and the Proxy API on PROXY_API_KEY", () => {
    expect(authEnvVar(listCalls)).toBe(API_KEY_ENV);
    expect(authEnvVar(infoExtensions)).toBe("PROXY_API_KEY");
    expect(authEnvVar(extList)).toBe("OPENAPI_API_KEY");
  });
});
