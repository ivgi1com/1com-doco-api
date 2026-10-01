import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { getApi, getEndpoint, listEndpoints } from "@/content";
import { getDemoFixtures, isDemoSimulatedWrite } from "@/content/demo";
import { getEndpointExamples } from "@/content/examples";
import type { Parameter } from "@/content/types";
import { listLiveTargetIds } from "@/server/playground/allowlist";
import { buildSample, exampleEndpoint, sampleLanguages } from "@/lib/code-samples";
import examplesDoc from "../../source-docs/openapi/examples.json";
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

/**
 * The only OpenAPI endpoints allowed Demo fixtures. Stage 3 decision
 * (docs/DECISIONS.md "Phase 8 planning"), revised Stage 4 (docs/DECISIONS.md
 * "Phase 8B planning and probe decisions" plus this session's resumed
 * scope, docs/SESSION_HANDOFF.md "Phase 8B Stage 4"): ailogs-list dropped
 * (404 on the test PBX); every other OpenAPI GET the masked probe returned
 * genuine data for is added (src/content/demo/openapi.ts has the full list
 * and the evidence rules).
 */
const DEMO_ALLOWED = new Set([
  "extensions-state-get",
  "aianalysis-get",
  "queues-list",
  "queues-get",
  "calleridblacklists-list",
  "calleridblacklists-get",
  "campaignnumbers-list",
  "campaignnumbers-get",
  "campaigns-list",
  "campaigns-get",
  "conditions-list",
  "conditions-get",
  "conferencerooms-list",
  "conferencerooms-get",
  "cronjobs-list",
  "cronjobs-get",
  "customdestinations-list",
  "customdestinations-get",
  "dids-list",
  "dids-get",
  "disas-list",
  "disas-get",
  "featurecodes-list",
  "featurecodes-get",
  "flows-list",
  "flows-get",
  "huntlists-list",
  "huntlists-get",
  "ivrs-list",
  "ivrs-get",
  "mediafiles-list",
  "mediafiles-get",
  "musiconholds-list",
  "musiconholds-get",
  "paginggroups-list",
  "paginggroups-get",
  "phonebooks-list",
  "phonebooks-get",
  "provisioningphones-list",
  "provisioningphones-get",
  "settings-list",
  "settings-get",
  "shortnumbers-list",
  "shortnumbers-get",
  "voicemails-list",
  "voicemails-get",
  "extensions-list",
  "extensions-get",
  "extensions-get-by-number",
  "simplecdrs-list",
  "phonebookentries-list",
  "phonebookentries-get",
]);

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

  it("gives Demo fixtures only to the approved endpoints", () => {
    // Writes may be Demo-simulated from documented examples only (SEC-REQ-27,
    // amended 2026-10-01); each still has to be listed in DEMO_ALLOWED.
    for (const e of endpoints) {
      const fixtures = getDemoFixtures("openapi", e.id);
      if (!DEMO_ALLOWED.has(e.id)) expect(fixtures, `${e.id} has Demo fixtures`).toBeUndefined();
      expect(isDemoSimulatedWrite("openapi", e), e.id).toBe(e.operationClass === "write" && fixtures !== undefined);
    }
  });

  it("never puts a write of any API on the Live allowlist (SEC-REQ-27)", () => {
    for (const id of listLiveTargetIds()) {
      const [apiId, endpointId] = id.split("/");
      const endpoint = getEndpoint(apiId, endpointId);
      expect(endpoint, id).toBeDefined();
      expect(endpoint?.operationClass, id).not.toBe("write");
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

describe("OpenAPI Reference completeness (Phase 8A)", () => {
  const byIdEp = new Map(endpoints.map((e) => [e.id, e]));
  const RAW_DIR = resolve(__dirname, "../../source-docs/raw/mirta-openapi");
  const exampleRows = examplesDoc.examples as unknown as Array<{
    operationId: string;
    method: string;
    title: string;
    path: string;
    query: Record<string, string>;
    body?: unknown;
    source: string;
  }>;

  it("maps every named official example to an operation, and every operation has one", () => {
    expect(examplesDoc.counts.matched).toBe(exampleRows.length);
    // The only unmatched example is the Overview's cross-resource authentication sample.
    expect(examplesDoc.unmatched.map((u: { source: string }) => u.source)).toEqual([
      "source-docs/raw/mirta-openapi/overview-and-examples.md",
    ]);
    for (const ex of exampleRows) {
      const e = byIdEp.get(ex.operationId);
      expect(e, `${ex.title}: unknown operation ${ex.operationId}`).toBeDefined();
      expect(ex.method, ex.title).toBe(e!.method);
    }
    const withExamples = new Set(exampleRows.map((x) => x.operationId));
    expect(endpoints.filter((e) => !withExamples.has(e.id)).map((e) => e.id)).toEqual([]);
  });

  it("counts every curl example heading on the official pages", () => {
    // Each heading whose first code block is a curl call is one example.
    let total = 0;
    for (const f of readdirSync(RAW_DIR).filter((n) => n.endsWith(".md"))) {
      const text = readFileSync(resolve(RAW_DIR, f), "utf8").replace(/\r\n/g, "\n");
      for (const part of text.split(/\n(?=#{2,3} )/)) {
        const first = part.match(/```\n([\s\S]*?)```/)?.[1];
        if (first?.includes("curl") && first.includes("pbx.example.com")) total++;
      }
    }
    expect(exampleRows.length + examplesDoc.unmatched.length).toBe(total);
  });

  it("normalizes real-looking example values and never carries a credential", () => {
    const text = JSON.stringify(exampleRows);
    for (const banned of ["CANISTRACCI", "CAN%", "Ada Rivera", "Bruno Long", "Kartoon", "39055123456", "change-this", "new-secret"]) {
      expect(text, banned).not.toContain(banned);
    }
    const walk = (v: unknown, key?: string): void => {
      if (typeof v === "string" && key && /(password|secret|pin|pincode|token)$/i.test(key)) expect(v, key).toBe("SYNTHETIC_SECRET");
      else if (Array.isArray(v)) v.forEach((x) => walk(x, key));
      else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) walk(x, k);
    };
    for (const ex of exampleRows) {
      walk(ex.body);
      expect(Object.keys(ex.query), `${ex.title}: key in query`).not.toContain("key");
    }
  });

  it("models every query parameter an official example uses", () => {
    const missing: string[] = [];
    for (const ex of exampleRows) {
      const e = byIdEp.get(ex.operationId)!;
      const names = new Set(e.queryParameters.map((p) => p.name));
      for (const k of Object.keys(ex.query)) if (!names.has(k)) missing.push(`${ex.operationId}: ${k} (${ex.title})`);
    }
    expect(missing).toEqual([]);
  });

  it("models every request-body key an official example uses (fields, aliases, or a documented numbered-key template)", () => {
    // A key is covered if it's a modeled field's own name, mentioned as a
    // backtick-quoted alias anywhere in the operation's field descriptions
    // or notes, or matches a documented numbered-key template (the IVR
    // digit-key / Condition / Custom Destination "not individually
    // modeled" precedent, e.g. `condition[N]`, `ivr_<n>`).
    const isCovered = (key: string, fieldNames: Set<string>, text: string): boolean => {
      if (fieldNames.has(key)) return true;
      if (text.includes(`\`${key}\``)) return true;
      const m = key.match(/^([a-z_]+?)(\d+)$/i);
      if (m) {
        const base = m[1];
        const templates = [`${base}[N]`, `${base}<n>`, `${base}_<n>`, `${base}<N>`];
        if (templates.some((t) => text.includes(`\`${t}\``))) return true;
      }
      return false;
    };
    const missing: string[] = [];
    for (const ex of exampleRows) {
      if (!ex.body || Array.isArray(ex.body) || typeof ex.body !== "object") continue;
      const e = byIdEp.get(ex.operationId)!;
      const fieldNames = new Set((e.requestBody ?? []).map((p) => p.name));
      const text = [...(e.requestBody ?? []).map((p) => p.description), ...(e.notes ?? [])].join(" ");
      for (const k of Object.keys(ex.body as Record<string, unknown>)) {
        if (!isCovered(k, fieldNames, text)) missing.push(`${ex.operationId}: ${k} (${ex.title})`);
      }
    }
    expect(missing).toEqual([]);
  });

  it("renders every example with the header credential and the portal base URL", () => {
    for (const ex of exampleRows) {
      const e = byIdEp.get(ex.operationId)!;
      for (const example of getEndpointExamples("openapi", e.id)) {
        const curl = buildSample(exampleEndpoint(e, example), openapi.baseUrl, "curl");
        expect(curl, ex.title).toContain("X-API-Key: $OPENAPI_API_KEY");
        expect(curl, ex.title).toContain(openapi.baseUrl);
        expect(curl, ex.title).not.toContain("pbx.example.com");
        expect(curl, ex.title).not.toMatch(/key=/);
      }
    }
  });

  it("represents every field of each official response field table", () => {
    // Every "## ... Fields" table on a reporting page (Response, Recording, Transcript
    // Segment, Response and CSV): each listed field appears in the endpoint's 2xx schema.
    const pages: Record<string, string> = {
      "cdr.md": "cdrs-list",
      "simple-cdr.md": "simplecdrs-list",
      "ai-analysis.md": "aianalysis-get",
      "ai-logs.md": "ailogs-list",
    };
    for (const [file, id] of Object.entries(pages)) {
      const text = readFileSync(resolve(RAW_DIR, file), "utf8").replace(/\r\n/g, "\n");
      const tables = text.split(/\n(?=## )/).filter((part) => /^## [^\n]*Fields/.test(part));
      const fields = new Set(tables.flatMap((t) => [...t.matchAll(/<tr><td>`([^`]+)`<\/td>/g)].map((m) => m[1])));
      expect(fields.size, file).toBeGreaterThan(0);
      const names = new Set<string>();
      const collect = (ps: Parameter[] = []): void => ps.forEach((p) => (names.add(p.name), collect(p.children)));
      collect(byIdEp.get(id)!.responses.find((r) => r.status < 300)?.schema);
      expect([...fields].filter((f) => !names.has(f)), `${id} missing response fields`).toEqual([]);
    }
  });

  it("models documented parent-object list filters as real query parameters, not notes-only", () => {
    // Both were previously documented only in an operationNotes bullet
    // ("not modeled as a separate parameter") — a real completeness gap
    // found in Phase 8A's baseline-vs-app audit, fixed via ResourceSpec.listFilters.
    const cases: Array<{ id: string; name: string; aliasesText: string }> = [
      { id: "phonebookentries-list", name: "phonebook_id", aliasesText: "pbid" },
      { id: "campaignnumbers-list", name: "campaign_id", aliasesText: "caid" },
    ];
    for (const { id, name, aliasesText } of cases) {
      const endpoint = byIdEp.get(id);
      expect(endpoint, id).toBeDefined();
      const param = endpoint!.queryParameters.find((p) => p.name === name);
      expect(param, `${id} is missing the ${name} query parameter`).toBeDefined();
      expect(param!.description, `${id} ${name} description`).toContain(aliasesText);
    }
  });
});
