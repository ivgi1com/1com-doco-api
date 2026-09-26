import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { getApi, listEndpoints } from "@/content";
import { observedOperationIds, withObserved } from "@/content/observed";
import type { Parameter } from "@/content/types";
import probe from "../../source-docs/observed/openapi/probe-2026-09-26.masked.json";

/** Phase 8B Stage 3: observed OpenAPI responses merged into Reference pages. */

type Shape = string | { [key: string]: Shape | Shape[] };

const openapi = getApi("openapi")!;
const endpoints = listEndpoints(openapi);
const byId = new Map(endpoints.map((e) => [e.id, e]));
const ids = observedOperationIds();
const followupKey: Record<string, string> = {
  "extensions-get": "extensions-get (by list id)",
  "extensions-get-by-number": "extensions-get-by-number",
  "extensions-state-get": "extensions-state-get",
  "phonebookentries-list": "phonebookentries-list (phonebook_id filter)",
  "phonebookentries-get": "phonebookentries-get",
  "aianalysis-get": "aianalysis-get (uniqueid from simplecdrs)",
};
const probeFile = probe as unknown as Record<"probe" | "followup", Record<string, { status?: number; body?: Shape }>>;

function bodyOf(id: string): Shape {
  const main = probeFile.probe[id];
  if (main?.status === 200 && main.body) return main.body;
  return probeFile.followup[followupKey[id]].body!;
}

/** Field paths in a masked shape, descending into arrays, keyed maps and nested objects. */
function shapePaths(s: Shape | Shape[], prefix = ""): string[] {
  const list = Array.isArray(s) ? s : [s];
  const out: string[] = [];
  for (const v of list) {
    if (typeof v !== "object") continue;
    if ("[array]" in v) out.push(...shapePaths((v as { items: Shape | Shape[] }).items, prefix));
    else if ("{object keyed by numeric ids}" in v) out.push(...shapePaths((v as { value: Shape }).value, prefix));
    else
      for (const [k, child] of Object.entries(v)) {
        out.push(prefix + k);
        out.push(...shapePaths(child as Shape | Shape[], `${prefix}${k}.`));
      }
  }
  return out;
}

function schemaPaths(params: Parameter[], prefix = ""): string[] {
  return params.flatMap((p) => [prefix + p.name, ...schemaPaths(p.children ?? [], `${prefix}${p.name}.`)]);
}

function walk(v: unknown, visit: (key: string, value: unknown) => void, key = ""): void {
  if (Array.isArray(v)) v.forEach((x) => walk(x, visit, key));
  else if (v && typeof v === "object") for (const [k, x] of Object.entries(v)) walk(x, visit, k);
  else visit(key, v);
}

describe("Observed OpenAPI responses (Phase 8B Stage 3)", () => {
  it("every observed id is a documented OpenAPI GET", () => {
    expect(ids.length).toBeGreaterThan(40);
    for (const id of ids) {
      const e = byId.get(id);
      expect(e, id).toBeDefined();
      expect(e!.method, id).toBe("GET");
    }
  });

  it("marks observed operations tested and adds an observed 200 only when no 2xx is documented", () => {
    for (const id of ids) {
      const e = byId.get(id)!;
      const merged = withObserved("openapi", e);
      expect(merged.verification.tested, id).toBe(true);
      const documented2xx = e.responses.some((r) => r.status >= 200 && r.status < 300);
      if (documented2xx) {
        expect(merged.responses, id).toEqual(e.responses);
      } else {
        const first = merged.responses[0];
        expect(first.status, id).toBe(200);
        expect(first.evidence, id).toBe("observed-sanitized");
        expect(first.verified, id).toBe(false);
        expect(merged.responses.slice(1), id).toEqual(e.responses);
      }
    }
  });

  it("every masked field appears in the observed schema", () => {
    for (const id of ids) {
      const e = byId.get(id)!;
      const added = withObserved("openapi", e).responses.find((r) => r.evidence === "observed-sanitized");
      if (!added?.schema) continue;
      const have = new Set(schemaPaths(added.schema));
      for (const path of new Set(shapePaths(bodyOf(id)))) expect(have.has(path), `${id}: ${path}`).toBe(true);
    }
  });

  it("observed examples carry no probe markers and no secret-shaped values", () => {
    for (const id of ids) {
      const added = withObserved("openapi", byId.get(id)!).responses.find((r) => r.evidence === "observed-sanitized");
      if (!added) continue;
      walk(added.example, (key, value) => {
        if (typeof value !== "string") return;
        expect(value, `${id}.${key}`).not.toMatch(/str\(|≤|\[array\]/);
        if (/(pass(word)?|secret|pin|token|md5)$/i.test(key) && value !== "") {
          expect(value, `${id}.${key}`).toBe("SYNTHETIC_SECRET");
        }
      });
    }
  });

  it("leaves Proxy and unprobed OpenAPI endpoints untouched", () => {
    const proxy = getApi("proxy")!;
    for (const e of listEndpoints(proxy)) expect(withObserved("proxy", e)).toBe(e);
    const unprobed = endpoints.find((e) => e.method !== "GET");
    expect(unprobed).toBeDefined();
    expect(withObserved("openapi", unprobed!)).toBe(unprobed);
  });

  it("every DOCS_AUDIT finding cited in an observed note exists", () => {
    const audit = readFileSync(resolve(__dirname, "../../source-docs/DOCS_AUDIT.md"), "utf8");
    const cited = new Set<string>();
    for (const e of endpoints) for (const n of withObserved("openapi", e).notes ?? []) for (const m of n.matchAll(/OA-\d+/g)) cited.add(m[0]);
    expect(cited.size).toBeGreaterThan(0);
    for (const ref of cited) expect(audit, ref).toMatch(new RegExp(`^${ref} — `, "m"));
  });
});
