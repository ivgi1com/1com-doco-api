import { describe, expect, it } from "vitest";
import { apis, listEndpoints } from "@/content";
import { openapiDemoFixtures } from "@/content/demo/openapi";
import { proxyDemoFixtures } from "@/content/demo/proxy";
import { guides } from "@/content/guides";
import { withObserved } from "@/content/observed";
import en from "../../messages/en.json";
import he from "../../messages/he.json";
import examplesDoc from "../../source-docs/openapi/examples.json";

/**
 * Phase 8E customer-copy guard (docs/phases/08E-customer-change-brief.md):
 * everything a customer can read in the portal is checked for vendor
 * branding, SRVxx identifiers and API-key label variants. Internal
 * provenance (`sourceUrl`, `source`, comments, source-docs/) is not rendered
 * and is skipped.
 */

/** Keys that hold provenance, not rendered copy. */
const SKIP_KEYS = new Set(["sourceUrl", "source", "sources", "file", "page"]);
/** The one quoted vendor path kept on purpose (user decision, 2026-10-01). */
const KEPT = ["/mirtapbx/proxyapi.php"];

interface Hit {
  path: string;
  text: string;
  /** Verbatim API error output (`error.message`): reproduces what the API returns. */
  apiOutput: boolean;
}

function collect(value: unknown, path: string, out: Hit[], apiOutput = false) {
  if (typeof value === "string") out.push({ path, text: value, apiOutput });
  else if (Array.isArray(value)) value.forEach((v, i) => collect(v, `${path}[${i}]`, out, apiOutput));
  else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (SKIP_KEYS.has(k)) continue;
      collect(v, `${path}.${k}`, out, apiOutput || k === "message");
    }
  }
}

const hits: Hit[] = [];
for (const api of apis) {
  collect({ name: api.name, summary: api.summary, categories: api.categories.map((c) => c.title) }, `api:${api.id}`, hits);
  for (const e of listEndpoints(api)) collect(withObserved(api.id, e), `${api.id}/${e.id}`, hits);
}
for (const g of guides) collect(g, `guide:${g.slug}`, hits);
for (const set of [...proxyDemoFixtures, ...openapiDemoFixtures]) collect(set, `demo:${set.endpoint}`, hits);
collect(examplesDoc.examples, "examples", hits);
collect(en, "messages:en", hits);
collect(he, "messages:he", hits);

function offenders(test: (h: Hit) => boolean): string[] {
  return hits
    .filter(test)
    .map((h) => `${h.path}: ${h.text.slice(0, 90)}`)
    .slice(0, 12);
}

describe("customer-visible copy", () => {
  it("collects a meaningful amount of copy", () => {
    expect(hits.length).toBeGreaterThan(5000);
  });

  it("never shows the vendor brand (Mirta) — only the one kept quoted vendor path", () => {
    expect(
      offenders((h) => /mirta/i.test(KEPT.reduce((t, k) => t.split(k).join(""), h.text))),
    ).toEqual([]);
  });

  it("never shows SRVxx identifiers (examples use PBX)", () => {
    expect(offenders((h) => /\bsrv\d+/i.test(h.text))).toEqual([]);
  });

  it('writes the customer key as "API Key" (no "API key" label)', () => {
    expect(offenders((h) => !h.apiOutput && /API key/.test(h.text))).toEqual([]);
  });

  it("has no Sample / Tenant API Key qualifier on the ordinary customer key", () => {
    expect(offenders((h) => /\b(sample|tenant) api key/i.test(h.text))).toEqual([]);
  });

  it("names the OpenAPI product '1com Open API' in selectors", () => {
    const names = apis.map((a) => a.name);
    expect(names).toContain("1com Open API");
    expect(names.join(" ")).not.toMatch(/mirta/i);
  });
});
