import { describe, expect, it } from "vitest";
import { sampleApi } from "@/content/sample-api";
import { getEndpoint } from "@/content";
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

describe("resolvePath", () => {
  it("substitutes path parameters with their example values", () => {
    expect(resolvePath(getCall)).toBe("/v1/call-records/call_0001");
  });

  it("leaves paths untouched when there are no path parameters", () => {
    expect(resolvePath(listCalls)).toBe("/v1/call-records");
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
});
