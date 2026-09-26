import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { getApi, listEndpoints } from "@/content";
import { getDemoFixtures } from "@/content/demo";
import { listLiveTargetIds } from "@/server/playground/allowlist";
import { buildSample, sampleLanguages } from "@/lib/code-samples";
import inventory from "../../source-docs/openapi/operations.json";

/**
 * Phase 8 coverage guard: source-docs/openapi/operations.json (one row per
 * documented method + path, generated from the resource files) and the
 * OpenAPI content model must agree.
 *
 * ROLLOUT_COMPLETE flips to true once Stage 2 has authored every resource;
 * until then missing operations are reported, not failed.
 */
const ROLLOUT_COMPLETE = true;

/** Stage 3 decision (docs/DECISIONS.md "Phase 8 planning"): the only OpenAPI endpoints allowed Demo fixtures. */
const DEMO_ALLOWED = new Set(["extensions-state-get", "ailogs-list", "aianalysis-get"]);

interface OperationRow {
  id: string;
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  path: string;
  operationClass: "read" | "write";
  file: string;
  page: string;
  securityReview: string;
}

const rows = inventory.operations as OperationRow[];
const openapi = getApi("openapi")!;
const endpoints = listEndpoints(openapi);
const byId = new Map(rows.map((r) => [r.id, r]));

describe("OpenAPI operation inventory", () => {
  it("has unique ids and method + path pairs", () => {
    const ids = rows.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    const keys = rows.map((r) => `${r.method} ${r.path}`);
    expect(new Set(keys).size).toBe(keys.length);
    for (const r of rows) expect(r.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("cites resource files that exist", () => {
    for (const r of rows) expect(existsSync(resolve(__dirname, "../..", r.file)), r.file).toBe(true);
  });

  it("classifies every non-GET operation as a write", () => {
    for (const r of rows) expect(r.operationClass, r.id).toBe(r.method === "GET" ? "read" : "write");
  });

  it("matches its own counts", () => {
    expect(inventory.counts.operations).toBe(rows.length);
  });
});

describe("OpenAPI content ↔ inventory", () => {
  it("every OpenAPI endpoint has a matching inventory row (method, path, class)", () => {
    for (const e of endpoints) {
      const row = byId.get(e.id);
      expect(row, `no inventory row for endpoint ${e.id}`).toBeDefined();
      expect(e.method, e.id).toBe(row!.method);
      expect(e.path, e.id).toBe(row!.path);
      expect(e.operationClass, e.id).toBe(row!.operationClass);
      expect(e.api, e.id).toBe("openapi");
      expect(e.fixedQuery, `${e.id} must not use fixedQuery (REST paths)`).toBeUndefined();
    }
  });

  it("cites its resource file and official page on every endpoint", () => {
    for (const e of endpoints) {
      const row = byId.get(e.id)!;
      expect(e.notes?.some((n) => n.includes(row.file.replace("source-docs/openapi/", ""))), `${e.id} source note`).toBe(true);
      expect(e.sourceUrl, e.id).toBe(`https://manual.mirtapbx.com/books/api/page/${row.page}`);
    }
  });

  it("is never tested or verified (no OpenAPI call has been made)", () => {
    for (const e of endpoints) {
      expect(e.verification.tested, e.id).toBe(false);
      expect(e.verification.verified, e.id).toBe(false);
      for (const r of e.responses) expect(r.evidence, `${e.id} ${r.status}`).not.toBe("observed-sanitized");
    }
  });

  it("puts no OpenAPI endpoint on the Live allowlist (SEC-REQ-27/28)", () => {
    const live = listLiveTargetIds();
    expect(live.filter((id) => id.startsWith("openapi/"))).toEqual([]);
  });

  it("gives Demo fixtures only to the approved read endpoints", () => {
    for (const e of endpoints) {
      const fixtures = getDemoFixtures("openapi", e.id);
      if (!DEMO_ALLOWED.has(e.id)) expect(fixtures, `${e.id} has Demo fixtures`).toBeUndefined();
      if (e.operationClass === "write") expect(fixtures, `${e.id} is a write with Demo fixtures`).toBeUndefined();
    }
  });

  it("authenticates with the X-API-Key header everywhere", () => {
    for (const e of endpoints) {
      expect(e.authentication.location, e.id).toBe("header");
      expect(e.authentication.parameter, e.id).toBe("X-API-Key");
    }
  });

  it("never documents an HTTP status for an error (no official page does)", () => {
    for (const e of endpoints) {
      if (!Array.isArray(e.errors)) continue;
      for (const err of e.errors) expect(err.status, `${e.id} ${err.code}`).toBe("undocumented");
    }
  });

  it("never gives two endpoints the same title", () => {
    const titles = endpoints.map((e) => e.title);
    const dup = titles.filter((t, i) => titles.indexOf(t) !== i);
    expect(dup).toEqual([]);
  });

  it("never documents two responses at the same status code", () => {
    for (const e of endpoints) {
      const statuses = e.responses.map((r) => r.status);
      expect(new Set(statuses).size, e.id).toBe(statuses.length);
    }
  });

  it("renders code samples with the header credential, never an inline key", () => {
    for (const e of endpoints) {
      for (const { id } of sampleLanguages) {
        const sample = buildSample(e, openapi.baseUrl, id);
        expect(sample, `${e.id} ${id}`).toContain("OPENAPI_API_KEY");
        expect(sample, `${e.id} ${id}`).toContain("X-API-Key");
        expect(sample, `${e.id} ${id}`).not.toMatch(/key=/);
        expect(sample, `${e.id} ${id}: unresolved path parameter`).not.toMatch(/\{[a-z_]+\}/);
      }
    }
  });

  it(ROLLOUT_COMPLETE ? "every inventory operation has an endpoint" : "reports operations still without an endpoint", () => {
    const have = new Set(endpoints.map((e) => e.id));
    const missing = rows.filter((r) => !have.has(r.id)).map((r) => r.id);
    if (ROLLOUT_COMPLETE) expect(missing).toEqual([]);
    else expect(missing.length).toBeLessThan(rows.length);
  });
});
