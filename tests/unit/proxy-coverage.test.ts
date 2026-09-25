import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { getApi, listEndpoints } from "@/content";
import inventory from "../../source-docs/proxy-api/operations.json";

/**
 * Phase 7 coverage guard: source-docs/proxy-api/operations.json (the
 * operation inventory) and the Proxy content model must agree.
 *
 * - Every Proxy endpoint in src/content maps to exactly one inventory row,
 *   with the same reqtype + discriminator and category.
 * - Every non-excluded inventory row has an endpoint — enforced only once
 *   ROLLOUT_COMPLETE is true (set at the end of Phase 7 Stage 3, when
 *   Reference authoring is done). Until then the missing set is reported.
 */
const ROLLOUT_COMPLETE = false;

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

  it(ROLLOUT_COMPLETE ? "every non-excluded operation has an endpoint" : "reports operations still without an endpoint", () => {
    const have = new Set(endpoints.map((e) => e.id));
    const missing = rows.filter((r) => !r.excluded && !have.has(r.id)).map((r) => r.id);
    if (ROLLOUT_COMPLETE) expect(missing).toEqual([]);
    else expect(missing.length).toBeLessThanOrEqual(rows.length);
  });
});

/** Case-insensitive on values: the sources mix `info=agents` / `info=EXTENSIONS` for the same parameter. */
function operationKey(reqtype: string, discriminator: Record<string, string>): string {
  const parts = Object.keys(discriminator)
    .sort()
    .map((k) => `${k}=${discriminator[k].toLowerCase()}`);
  return [reqtype.toUpperCase(), ...parts].join("&");
}
