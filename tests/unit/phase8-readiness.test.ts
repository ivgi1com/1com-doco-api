import { afterEach, describe, expect, it, vi } from "vitest";
import { getApi, getEndpoint, listEndpoints } from "@/content";
import { getDemoFixtures, isDemoSimulatedWrite } from "@/content/demo";
import { openapiDemoFixtures } from "@/content/demo/openapi";
import { demoProvider, isSecretField, liveProvider } from "@/components/playground/executor";
import { listLiveTargetIds } from "@/server/playground/allowlist";
import operationsDoc from "../../source-docs/openapi/operations.json";
import resourcesDoc from "../../source-docs/openapi/resources.json";
import { EXCLUDED_OPENAPI_OPS, EXCLUDED_OPENAPI_RESOURCE_FILES } from "./helpers/exclusions";

/**
 * Phase 8D readiness gate (docs/phases/08D-pre-stage6-readiness-gate.md §5):
 * deterministic boundary checks that earlier phases covered only by sample or
 * by prose. Not the Stage 6 security review.
 */

const openapi = getApi("openapi")!;
const endpoints = listEndpoints(openapi);
const KEY = "TEST_KEY_do_not_leak_8d71";

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("Demo never reaches a network (all OpenAPI operations)", () => {
  it("makes no fetch for any portal operation, fixtured or not, with its first scenario applied", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect(endpoints).toHaveLength(operationsDoc.operations.length - EXCLUDED_OPENAPI_OPS.size);
    for (const endpoint of endpoints) {
      const preset = getDemoFixtures("openapi", endpoint.id)?.cases[0].preset ?? {};
      const fieldValues = Object.fromEntries(Object.entries(preset).map(([k, v]) => [`query:${k}`, v]));
      const pending = demoProvider.execute(
        { api: openapi, endpoint, fieldValues, credential: KEY, simulateError: false },
        new AbortController().signal,
      );
      await vi.advanceTimersByTimeAsync(1000);
      const result = await pending;
      expect(result.source, endpoint.id).toBe("DEMO");
      expect(JSON.stringify(result), `${endpoint.id} leaked the credential`).not.toContain(KEY);
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("Live refuses every OpenAPI operation before any request (none is Live-enabled)", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    // A write is refused client-side; a read has no allowlisted id, so the portal
    // would answer endpoint_not_allowed, and the allowlist below proves that.
    const writes = endpoints.filter((e) => e.operationClass === "write");
    for (const endpoint of writes) {
      const result = await liveProvider.execute(
        { api: openapi, endpoint, fieldValues: {}, credential: KEY, simulateError: false },
        new AbortController().signal,
      );
      expect(result, endpoint.id).toMatchObject({ source: "LIVE", kind: "portal-error", code: "endpoint_not_allowed" });
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("Live allowlist", () => {
  // Phase 9 (2026-10-08) added the first OpenAPI read, simplecdrs-list.
  it("is exactly the three approved Proxy reads plus the Phase 9 OpenAPI pilot", () => {
    expect([...listLiveTargetIds()].sort()).toEqual([
      "openapi/simplecdrs-list",
      "proxy/cdr-get",
      "proxy/info-agents",
      "proxy/info-extensions",
    ]);
    for (const id of listLiveTargetIds()) {
      const [apiId, endpointId] = id.split("/");
      expect(getEndpoint(apiId, endpointId)?.operationClass, id).not.toBe("write");
    }
  });
});

describe("SEC-REQ-05 (Auth Token) and SEC-REQ-06 (Dial) categorical exclusions", () => {
  const ids = endpoints.filter((e) => /^(auth-token|dial)/.test(e.id)).map((e) => e.id);

  it("keeps Dial and removes Auth Token from the portal entirely (Phase 8E)", () => {
    expect(ids.sort()).toEqual(["dial"]);
    expect(EXCLUDED_OPENAPI_OPS.has("auth-token-create") && EXCLUDED_OPENAPI_OPS.has("auth-token-delete")).toBe(true);
  });

  it.each(ids)("%s has no Demo fixture, is not Demo-simulatable, and is not Live-allowlisted", (id) => {
    const endpoint = getEndpoint("openapi", id)!;
    expect(endpoint.operationClass).toBe("write");
    expect(getDemoFixtures("openapi", id)).toBeUndefined();
    expect(isDemoSimulatedWrite("openapi", endpoint)).toBe(false);
    expect(listLiveTargetIds()).not.toContain(`openapi/${id}`);
  });

  it.each(ids)("%s answers Demo with 'unavailable', never a response body", async (id) => {
    vi.useFakeTimers();
    const endpoint = getEndpoint("openapi", id)!;
    const pending = demoProvider.execute(
      { api: openapi, endpoint, fieldValues: {}, credential: "", simulateError: false },
      new AbortController().signal,
    );
    await vi.advanceTimersByTimeAsync(1000);
    expect(await pending).toMatchObject({ source: "DEMO", unavailable: true });
  });
});

describe("Demo fixtures never carry a credential-shaped value (SEC-REQ-15/19/20/22/26 class)", () => {
  const PLACEHOLDERS = new Set(["SYNTHETIC_SECRET", "", null]);

  let inspected = 0;

  function walk(value: unknown, path: string, out: string[]) {
    if (Array.isArray(value)) value.forEach((v, i) => walk(v, `${path}[${i}]`, out));
    else if (value && typeof value === "object") {
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        const here = `${path}.${k}`;
        if (isSecretField(k) && (typeof v !== "object" || v === null)) {
          inspected++;
          if (!PLACEHOLDERS.has(v as string | null)) out.push(`${here} = ${JSON.stringify(v)}`);
        }
        walk(v, here, out);
      }
    }
  }

  it("every secret-named field in every OpenAPI fixture body is SYNTHETIC_SECRET, empty or null", () => {
    const offenders: string[] = [];
    for (const set of openapiDemoFixtures) {
      for (const c of set.cases) walk(c.response.body, `${set.endpoint}#${c.id}`, offenders);
    }
    expect(offenders).toEqual([]);
    // The walk must really have looked at secret-named fields (not pass vacuously).
    expect(inspected).toBeGreaterThanOrEqual(5); // 8 at 8D (ds_pin, imap credentials, pin fields)
  });
});

describe("Baseline ↔ inventory ↔ content reconciliation", () => {
  const pages = resourcesDoc.pages.filter((p) => p.pageType === "resource");
  const ops = operationsDoc.operations;

  it("37 resource pages, matching the inventory and the declared counts", () => {
    expect(pages).toHaveLength(37);
    expect(resourcesDoc.counts.uniqueResources).toBe(37);
    expect(operationsDoc.counts.resources).toBe(37);
    expect(new Set(ops.map((o) => o.file)).size).toBe(37);
  });

  it("every operation carries its resource page's security label", () => {
    const labelByFile = new Map(pages.map((p) => [p.file, p.securityReview]));
    for (const op of ops) {
      expect(labelByFile.get(op.file), `${op.id} (${op.file})`).toBe(op.securityReview);
    }
  });

  it("every resource page has operations, and every operation is a content endpoint", () => {
    const files = new Set(ops.map((o) => o.file));
    for (const p of pages) expect(files.has(p.file), p.slug).toBe(true);
    const ids = new Set(endpoints.map((e) => e.id));
    // Every baseline operation is either in the portal or deliberately excluded (Phase 8E), never both.
    for (const op of ops) expect(ids.has(op.id) !== EXCLUDED_OPENAPI_OPS.has(op.id), op.id).toBe(true);
    expect(ids.size).toBe(ops.length - EXCLUDED_OPENAPI_OPS.size);
    // Excluded resources are excluded whole.
    for (const op of ops) expect(EXCLUDED_OPENAPI_RESOURCE_FILES.has(op.file), op.id).toBe(EXCLUDED_OPENAPI_OPS.has(op.id));
  });

  // The baseline's BLOCK LIVE marks stay as recorded on 2026-09-26. An
  // operation leaves the block only by an explicit user decision that closes
  // its SEC-REQ for Live (docs/SECURITY.md); each is listed here.
  const LIVE_BLOCK_LIFTED = new Set(["simplecdrs-list"]); // SEC-REQ-08, Phase 9, 2026-10-08

  it("BLOCK LIVE operations are never Live-enabled (unless explicitly lifted) or Demo-simulated writes", () => {
    for (const op of ops.filter((o) => o.securityReview === "BLOCK LIVE")) {
      if (!LIVE_BLOCK_LIFTED.has(op.id)) expect(listLiveTargetIds()).not.toContain(`openapi/${op.id}`);
      expect(isDemoSimulatedWrite("openapi", { id: op.id, operationClass: op.operationClass as "read" | "write" })).toBe(false);
    }
    // Every lifted id is a real BLOCK LIVE read, so the exemption can't silently widen.
    for (const id of LIVE_BLOCK_LIFTED) {
      const op = ops.find((o) => o.id === id);
      expect(op?.securityReview, id).toBe("BLOCK LIVE");
      expect(op?.operationClass, id).toBe("read");
    }
    const liftedLive = listLiveTargetIds().filter((id) => id.startsWith("openapi/")).map((id) => id.slice("openapi/".length));
    for (const id of liftedLive) {
      const op = ops.find((o) => o.id === id);
      if (op?.securityReview === "BLOCK LIVE") expect(LIVE_BLOCK_LIFTED.has(id), id).toBe(true);
    }
  });
});
