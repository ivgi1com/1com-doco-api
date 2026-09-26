import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { getApi, listEndpoints } from "@/content";
import { getDemoFixtures } from "@/content/demo";
import { listLiveTargetIds } from "@/server/playground/allowlist";
import { buildSample } from "@/lib/code-samples";
import inventory from "../../source-docs/proxy-api/operations.json";

/**
 * Phase 7 coverage guard: source-docs/proxy-api/operations.json (the
 * operation inventory) and the Proxy content model must agree.
 *
 * - Every Proxy endpoint in src/content maps to exactly one inventory row,
 *   with the same reqtype + discriminator and category.
 * - Every non-excluded inventory row has an endpoint — enforced now that
 *   Stage 3 (Reference authoring) is complete (109/109, 2026-09-25).
 */
const ROLLOUT_COMPLETE = true;

interface OperationRow {
  id: string;
  reqtype: string;
  discriminator: Record<string, string>;
  category: string;
  class: "read" | "write" | "unclear";
  keyScope: "admin" | "not_documented";
  source: string;
  hasExample: boolean;
  hasResponse: boolean;
  bodyEncoding?: string;
  responseFormatHint?: string;
  note?: string;
  excluded?: string;
}

const rows = inventory.operations as OperationRow[];
const proxy = getApi("proxy")!;
const endpoints = listEndpoints(proxy);

describe("operation inventory", () => {
  it("has unique ids and valid fields", () => {
    const ids = rows.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const r of rows) {
      expect(r.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      expect(["read", "write", "unclear"]).toContain(r.class);
      expect(["admin", "not_documented"]).toContain(r.keyScope);
      expect(r.source.length).toBeGreaterThan(0);
      if ("excluded" in r) expect(r.excluded!.length).toBeGreaterThan(10);
    }
  });

  it("cites source files that exist", () => {
    for (const r of rows) {
      const file = r.source.split(/[;\s]/)[0];
      expect(existsSync(resolve(__dirname, "../../source-docs/proxy-api", file)), `${r.id}: ${file}`).toBe(true);
    }
  });

  it("has unique reqtype + discriminator pairs", () => {
    const keys = rows.map((r) => operationKey(r.reqtype, r.discriminator));
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe("content ↔ inventory", () => {
  const byId = new Map(rows.map((r) => [r.id, r]));

  it("every Proxy endpoint has a matching, non-excluded inventory row", () => {
    for (const e of endpoints) {
      const row = byId.get(e.id);
      expect(row, `no inventory row for endpoint ${e.id}`).toBeDefined();
      expect(row!.excluded, `${e.id} is excluded but has an endpoint`).toBeUndefined();
      const { reqtype, ...rest } = e.fixedQuery ?? {};
      expect(operationKey(reqtype ?? "", rest), e.id).toBe(operationKey(row!.reqtype, row!.discriminator));
      expect(e.category, e.id).toBe(row!.category);
    }
  });

  it("agrees on read/write class and key scope", () => {
    for (const e of endpoints) {
      const row = byId.get(e.id)!;
      expect(e.operationClass === "write", `${e.id} operationClass`).toBe(row.class === "write");
      if (row.keyScope === "admin") expect(e.authentication.scope, e.id).toBe("Admin key");
    }
  });

  it("gives write and unclear operations no Demo fixtures and no Live policy", () => {
    const live = new Set(listLiveTargetIds());
    for (const r of rows.filter((r) => r.class !== "read")) {
      expect(getDemoFixtures("proxy", r.id), `${r.id} has Demo fixtures`).toBeUndefined();
      expect(live.has(`proxy/${r.id}`), `${r.id} is Live-allowlisted`).toBe(false);
    }
  });

  it("never gives two endpoints the same title", () => {
    // Duplicate titles collide in the Playground's endpoint-picker button
    // text and in e2e locators. Found: info-extensions/managedb-extension-list
    // both "List extensions"; info-dids/managedb-did-list both "List DIDs".
    const byTitle = new Map<string, string[]>();
    for (const e of endpoints) {
      if (!byTitle.has(e.title)) byTitle.set(e.title, []);
      byTitle.get(e.title)!.push(e.id);
    }
    for (const [title, ids] of byTitle) {
      expect(ids.length, `title "${title}" used by ${ids.join(", ")}`).toBe(1);
    }
  });

  it("never documents two responses at the same status code", () => {
    // The response viewer (ResponseExamples) keys its status selector by
    // `status` alone: a second entry at the same code is a silent bug — a
    // duplicate-React-key warning, and the second example becomes
    // unreachable. Found authoring responsepath-getlast (a plain sample and
    // an xml sample both at 200); the fix folds the second variant into
    // `notes` instead of a second ResponseSpec.
    for (const e of endpoints) {
      const statuses = e.responses.map((r) => r.status);
      expect(new Set(statuses).size, `${e.id} has duplicate response statuses: ${statuses.join(", ")}`).toBe(statuses.length);
    }
  });

  it(ROLLOUT_COMPLETE ? "every non-excluded operation has an endpoint" : "reports operations still without an endpoint", () => {
    const have = new Set(endpoints.map((e) => e.id));
    const missing = rows.filter((r) => !r.excluded && !have.has(r.id)).map((r) => r.id);
    if (ROLLOUT_COMPLETE) expect(missing).toEqual([]);
    else expect(missing.length).toBeLessThanOrEqual(rows.length);
  });

  it("never parses a JSON-primary response without a sample that requests format=json (Stage 7 finding 1)", () => {
    // buildQueryAuthSample picks response.json()/print(response.json()) from
    // responses[0].format, independent of what query parameters the sample
    // actually sends. If the primary documented response is json but no
    // query parameter (fixed or example) sends format=json, the generated
    // JS/Python samples parse a body the request never asked for — Stage 7
    // review finding 1.
    for (const e of endpoints) {
      if (e.responses[0]?.format !== "json") continue;
      const sendsJsonFormat =
        e.fixedQuery?.format === "json" ||
        e.queryParameters.some((p) => p.name === "format" && p.example === "json");
      expect(sendsJsonFormat, `${e.id}: primary response is json but no sample requests format=json`).toBe(true);
    }
  });

  it("JS/Python samples never call response.json() without format=json in their own params", () => {
    const baseUrl = "https://pbx6webserver.1com.co.il/pbx/proxyapi.php";
    const requestsJsonFormat = /"format":\s*"json"/;
    for (const e of endpoints) {
      if (e.authentication.location !== "query") continue; // header-auth (Sample API) is out of scope here
      const js = buildSample(e, baseUrl, "javascript");
      const py = buildSample(e, baseUrl, "python");
      if (js.includes("await response.json()")) {
        expect(js, `${e.id}: JS sample parses response.json() without format=json in its own query params`).toMatch(requestsJsonFormat);
      }
      if (py.includes("print(response.json())")) {
        expect(py, `${e.id}: Python sample parses response.json() without format=json in its own query params`).toMatch(requestsJsonFormat);
      }
    }
  });

  it("never presents an error/empty-body probe observation as the endpoint's success response (Stage 7 finding 4)", () => {
    // These 13 operations' only Stage 4 observation was a missing-parameter
    // error or an empty/no-data body — none has a confirmed success
    // response. Excluded on purpose (source-docs/DOCS_AUDIT.md, Stage 7
    // remediation note): `channel` and `help` each returned *some*
    // non-empty, non-error data alongside a separate error case, so their
    // description doesn't claim a confirmed success either, but isn't pure
    // error/empty; `info-recording`, `info-playrecording`,
    // `mediafile-getaudio` and `responsepath-getlast` already keep a
    // vendor-sourced response and fold the observed error/empty case into
    // a note instead of the response itself.
    const errorOrEmptyOnly = [
      "info-inforecording",
      "info-voicemailtranscript",
      "info-cdrs",
      "info-variable",
      "agent-listqueues",
      "countcalls",
      "countchannels",
      "voicemail-messages",
      "phonebook-query",
      "virtualext-list",
      "queue-list",
      "responsepath-list",
      "responsepath-getid",
    ];
    expect(errorOrEmptyOnly).toHaveLength(13);
    for (const id of errorOrEmptyOnly) {
      const endpoint = endpoints.find((e) => e.id === id);
      expect(endpoint, `${id}: not found in the Proxy content model`).toBeDefined();
      const response = endpoint!.responses[0];
      expect(response, `${id}: expected a responses[0] entry`).toBeDefined();
      expect(response!.status).toBe(200);
      expect(
        response!.description,
        `${id}: response description should lead with "Success response" rather than present the observed error/empty body as if it were one`,
      ).toMatch(/^Success response/);
    }
  });
});

/** Case-insensitive on values: the sources mix `info=agents` / `info=EXTENSIONS` for the same parameter. */
function operationKey(reqtype: string, discriminator: Record<string, string>): string {
  const parts = Object.keys(discriminator)
    .sort()
    .map((k) => `${k}=${discriminator[k].toLowerCase()}`);
  return [reqtype.toUpperCase(), ...parts].join("&");
}
