import { describe, expect, it } from "vitest";
import { getEndpoint } from "@/content";
import { getDemoFixtures, resolveDemoCase } from "@/content/demo";
import { openapiDemoFixtures } from "@/content/demo/openapi";
import { proxyDemoFixtures } from "@/content/demo/proxy";
import type { DemoFixtureSet } from "@/content/demo/types";
import observedInfoExtensions from "../../source-docs/observed/info-extensions.json";
import observedInfoQueuelogs from "../../source-docs/observed/info-queuelogs.json";

/**
 * Tests for the Demo fixture model (src/content/demo/): the resolver
 * itself, plus three guards on the fixture data — exhaustiveness (every
 * `when` covers every one of the endpoint's own query parameters),
 * schema conformance (fixture bodies match the documented response
 * schema), and a synthetic-value guard (nothing here is, or was derived
 * from, real observed data). Generalized in Phase 8 Stage 3 to iterate
 * over every API's fixture sets, not just Proxy's.
 */

const FIXTURE_ENDPOINTS = [
  { apiId: "proxy", endpointId: "info-extensions" },
  { apiId: "proxy", endpointId: "info-agents" },
  { apiId: "proxy", endpointId: "info-dids" },
  { apiId: "proxy", endpointId: "info-simplecdrs" },
  { apiId: "proxy", endpointId: "info-queuelogs" },
  // Phase 7 Stage 5 (source-docs/DOCS_AUDIT.md A-56..A-77):
  { apiId: "proxy", endpointId: "info-queues" },
  { apiId: "proxy", endpointId: "info-queue" },
  { apiId: "proxy", endpointId: "info-agentsconnected" },
  { apiId: "proxy", endpointId: "info-agentsdelay" },
  { apiId: "proxy", endpointId: "info-outdialed" },
  { apiId: "proxy", endpointId: "info-config" },
  { apiId: "proxy", endpointId: "info-balance" },
  { apiId: "proxy", endpointId: "info-extstate" },
  { apiId: "proxy", endpointId: "peers" },
  { apiId: "proxy", endpointId: "blfs" },
  { apiId: "proxy", endpointId: "flows" },
  { apiId: "proxy", endpointId: "countpeers" },
  { apiId: "proxy", endpointId: "voicemail-list" },
  // Phase 8 Stage 3 (docs/DECISIONS.md "Phase 8 planning"):
  { apiId: "openapi", endpointId: "extensions-state-get" },
  { apiId: "openapi", endpointId: "ailogs-list" },
  { apiId: "openapi", endpointId: "aianalysis-get" },
] as const;

const allFixtureSets: readonly DemoFixtureSet[] = [...proxyDemoFixtures, ...openapiDemoFixtures];

function fixtureSetFor(apiId: string, endpointId: string): DemoFixtureSet {
  const set = allFixtureSets.find((s) => s.endpoint === `${apiId}/${endpointId}`);
  if (!set) throw new Error(`no fixture set for ${apiId}/${endpointId}`);
  return set;
}

describe("resolveDemoCase", () => {
  const set = fixtureSetFor("proxy", "info-agents");

  it("returns undefined-set as null (no fixtures for this endpoint)", () => {
    expect(resolveDemoCase(undefined, { tenant: "ACME" })).toBeNull();
  });

  it("matches a wildcard param regardless of value", () => {
    const resolved = resolveDemoCase(set, { tenant: "ANYTHING", queue: "", format: "json" });
    expect(resolved?.id).toBe("known-json");
  });

  it("matches an explicit list, including the empty-string entry for an omitted field", () => {
    const resolved = resolveDemoCase(set, { format: "json" }); // queue/tenant absent -> ""
    expect(resolved?.id).toBe("known-json");
  });

  it("treats a param missing from `params` as empty, same as an omitted/cleared field", () => {
    const withExplicitEmpty = resolveDemoCase(set, { tenant: "", queue: "", format: "json" });
    const withoutKeys = resolveDemoCase(set, { format: "json" });
    expect(withoutKeys?.id).toBe(withExplicitEmpty?.id);
  });

  it("is first-match-wins: an unknown queue still matches known-json's queue wildcard first only if declared before unknown-json", () => {
    // known-json declares queue as ["", KNOWN_QUEUE] (a list), so a queue
    // outside that list must fall through to unknown-json's wildcard.
    const resolved = resolveDemoCase(set, { queue: "999999", format: "json" });
    expect(resolved?.id).toBe("unknown-json");
  });

  it("returns null when no case matches (shown by the Playground as Not simulated)", () => {
    const resolved = resolveDemoCase(set, { tenant: "ACME", queue: "", format: "xml" });
    expect(resolved).toBeNull();
  });

  it("trims whitespace off param values before matching", () => {
    const resolved = resolveDemoCase(set, { queue: "  ", format: " json " });
    expect(resolved?.id).toBe("known-json");
  });
});

describe("getDemoFixtures", () => {
  it("resolves every fixtured endpoint", () => {
    for (const { apiId, endpointId } of FIXTURE_ENDPOINTS) {
      expect(getDemoFixtures(apiId, endpointId), `${apiId}/${endpointId}`).toBeDefined();
    }
  });

  it("each scenario chip resolves to its own case, given the Playground's prefilled defaults", () => {
    // A chip applies its preset on top of the fields' prefilled example
    // values (use-playground.ts); with first-match resolution, an earlier
    // catch-all case must not swallow a later, more specific one.
    for (const { apiId, endpointId } of FIXTURE_ENDPOINTS) {
      const endpoint = getEndpoint(apiId, endpointId)!;
      const set = getDemoFixtures(apiId, endpointId)!;
      const defaults = Object.fromEntries(
        endpoint.queryParameters.filter((p) => p.example !== undefined).map((p) => [p.name, String(p.example)]),
      );
      for (const c of set.cases) {
        expect(resolveDemoCase(set, { ...defaults, ...c.preset })?.id, `${apiId}/${endpointId} ${c.id}`).toBe(c.id);
      }
    }
  });

  it("has no fixture set for endpoints deliberately not simulated", () => {
    // cdr-get: never had fixtures (no synthetic replay plan).
    expect(getDemoFixtures("proxy", "cdr-get")).toBeUndefined();
  });
});

describe("fixture exhaustiveness: every `when` covers every query parameter, nothing extra", () => {
  for (const { apiId, endpointId } of FIXTURE_ENDPOINTS) {
    it(`${apiId}/${endpointId}`, () => {
      const endpoint = getEndpoint(apiId, endpointId);
      expect(endpoint, `content endpoint ${apiId}/${endpointId} must exist`).toBeDefined();
      const paramNames = endpoint!.queryParameters.map((p) => p.name).sort();
      const set = fixtureSetFor(apiId, endpointId);
      expect(set.cases.length).toBeGreaterThan(0);
      for (const demoCase of set.cases) {
        const whenKeys = Object.keys(demoCase.when).sort();
        expect(whenKeys, `${demoCase.id}.when keys`).toEqual(paramNames);
      }
    });
  }
});

describe("fixture schema conformance (bodies match the documented response schema)", () => {
  it("info-extensions JSON cases: each record has exactly the 6 allowlisted fields", () => {
    const expected = ["ex_id", "ex_number", "ex_name", "ex_tech", "st_state", "username"].sort();
    const set = fixtureSetFor("proxy", "info-extensions");
    const jsonCase = set.cases.find((c) => c.id === "list-json")!;
    const body = jsonCase.response.body as Array<Record<string, unknown>>;
    expect(body.length).toBeGreaterThan(0);
    for (const record of body) {
      expect(Object.keys(record).sort()).toEqual(expected);
    }
  });

  it("info-agents JSON cases: each record has exactly the observed positional keys", () => {
    const expected = ["0", "1", "2", "4", "5", "6", "7", "8", "10", "11"].sort();
    const set = fixtureSetFor("proxy", "info-agents");
    const knownCase = set.cases.find((c) => c.id === "known-json")!;
    const body = knownCase.response.body as Record<string, Record<string, unknown>>;
    for (const record of Object.values(body)) {
      expect(Object.keys(record).sort()).toEqual(expected);
    }
    const unknownCase = set.cases.find((c) => c.id === "unknown-json")!;
    expect(unknownCase.response.body).toBeNull();
  });

  it("info-dids JSON cases: each record has exactly the 10 documented fields", () => {
    const expected = [
      "di_country",
      "di_area",
      "di_number",
      "di_comment",
      "di_recording",
      "di_faxstationid",
      "di_fax_email",
      "di_maxchannels",
      "di_emailrecording",
      "di_smsemail",
    ].sort();
    const set = fixtureSetFor("proxy", "info-dids");
    const jsonCase = set.cases.find((c) => c.id === "list-json")!;
    const body = jsonCase.response.body as Array<Record<string, unknown>>;
    expect(body.length).toBeGreaterThan(0);
    for (const record of body) {
      expect(Object.keys(record).sort()).toEqual(expected);
    }
    const csvCase = set.cases.find((c) => c.id === "csv-empty")!;
    expect(csvCase.response.body).toBe("");
  });

  it("info-simplecdrs JSON cases: each record has the 11 named fields plus their positional duplicates (A-49)", () => {
    const named = [
      "sc_te_id",
      "tenantcode",
      "sc_start",
      "sc_direction",
      "sc_calleridnum",
      "sc_calleridname",
      "sc_dialednum",
      "sc_disposition",
      "sc_duration",
      "sc_uniqueid",
      "sc_whoanswered",
    ];
    const positional = Array.from({ length: 11 }, (_, i) => String(i));
    const expected = [...named, ...positional].sort();
    const set = fixtureSetFor("proxy", "info-simplecdrs");
    for (const id of ["unfiltered-json", "matched-json"]) {
      const demoCase = set.cases.find((c) => c.id === id)!;
      const body = demoCase.response.body as Array<Record<string, unknown>>;
      expect(body.length).toBeGreaterThan(0);
      for (const record of body) {
        expect(Object.keys(record).sort(), `${id} record keys`).toEqual(expected);
        // The positional duplicate at index i must equal the i-th named field's value.
        named.forEach((key, i) => {
          expect(record[String(i)]).toBe(record[key]);
        });
      }
    }
    // A-49: no-match returns an empty 200 body, not [].
    const noMatch = set.cases.find((c) => c.id === "no-match-json")!;
    expect(noMatch.response.body).toBe("");
    expect(noMatch.response.format).toBe("text");
  });
});

describe("blfs/flows fixtures (A-72, A-73): positional keys mirror named fields", () => {
  it("blfs JSON case: each record has st_extension/st_state/st_timestamp plus their 3 positional duplicates (A-72)", () => {
    const named = ["st_extension", "st_state", "st_timestamp"];
    const positional = Array.from({ length: 3 }, (_, i) => String(i));
    const expected = [...named, ...positional].sort();
    const set = fixtureSetFor("proxy", "blfs");
    const demoCase = set.cases.find((c) => c.id === "list-json")!;
    const body = demoCase.response.body as Array<Record<string, unknown>>;
    expect(body.length).toBeGreaterThan(0);
    for (const record of body) {
      expect(Object.keys(record).sort(), "blfs record keys").toEqual(expected);
      named.forEach((key, i) => {
        expect(record[String(i)], `positional "${i}" mirrors ${key}`).toBe(record[key]);
      });
    }
  });

  it("flows JSON case: each record has all 18 named fl_*/st_* fields plus their 18 positional duplicates (A-73)", () => {
    const named = [
      "fl_id",
      "fl_te_id",
      "fl_name",
      "fl_comment",
      "fl_number",
      "fl_value",
      "fl_value_for_unavailable",
      "fl_value_for_inuse",
      "fl_value_for_notinuse",
      "fl_value_for_ringing",
      "fl_variable_name",
      "fl_monitor_type",
      "fl_monitor_type_id",
      "fl_monitor_parameter",
      "st_extension",
      "st_state",
      "st_timestamp",
      "st_peername",
    ];
    expect(named).toHaveLength(18);
    const positional = Array.from({ length: 18 }, (_, i) => String(i));
    const expected = [...named, ...positional].sort();
    const set = fixtureSetFor("proxy", "flows");
    const demoCase = set.cases.find((c) => c.id === "list-json")!;
    const body = demoCase.response.body as Array<Record<string, unknown>>;
    expect(body.length).toBeGreaterThan(0);
    for (const record of body) {
      expect(Object.keys(record).sort(), "flows record keys").toEqual(expected);
      named.forEach((key, i) => {
        expect(record[String(i)], `positional "${i}" mirrors ${key}`).toBe(record[key]);
      });
    }
  });
});

describe("info-queuelogs fixtures (A-50, A-55)", () => {
  const set = fixtureSetFor("proxy", "info-queuelogs");
  const abandoned = set.cases.find((c) => c.id === "abandoned-json")!;
  const records = abandoned.response.body as Array<Record<string, unknown>>;
  const observed = observedInfoQueuelogs.response[0] as Record<string, unknown>;
  const observedNamed = Object.keys(observed).filter((k) => !/^\d+$/.test(k));

  it("each record has exactly the observed 156 named fields, in observed order, plus their positional twins", () => {
    expect(observedNamed).toHaveLength(156);
    expect(records.length).toBeGreaterThan(0);
    for (const record of records) {
      expect(Object.keys(record)).toEqual(Object.keys(observed));
      observedNamed.forEach((name, i) => {
        expect(record[String(i)], `positional "${i}" mirrors ${name}`).toBe(record[name]);
      });
    }
  });

  it("every ex_* field (the joined extension row, which carries credentials) is null, as observed", () => {
    for (const record of records) {
      const exKeys = observedNamed.filter((k) => k.startsWith("ex_"));
      expect(exKeys).toHaveLength(147);
      for (const k of exKeys) expect(record[k], k).toBeNull();
    }
  });

  it("identifying values are synthetic", () => {
    for (const record of records) {
      expect(String(record.qu_name)).toMatch(/^Demo /);
      expect(String(record.callid)).toMatch(/^demo\d*-/);
    }
  });

  it("empty results reproduce A-50: json is the single byte ], csv is empty", () => {
    const json = set.cases.find((c) => c.id === "no-data-json")!;
    expect(json.response.body).toBe("]");
    expect(json.response.format).toBe("text");
    const csv = set.cases.find((c) => c.id === "no-data-csv")!;
    expect(csv.response.body).toBe("");
  });
});

describe("voicemail-list fixtures (A-77, SECURITY)", () => {
  it("imapuser and imappassword are null in every record, in every case", () => {
    const set = fixtureSetFor("proxy", "voicemail-list");
    for (const demoCase of set.cases) {
      const body = demoCase.response.body as Array<Record<string, unknown>>;
      for (const record of body) {
        expect(record.imapuser, `${demoCase.id}.imapuser`).toBeNull();
        expect(record.imappassword, `${demoCase.id}.imappassword`).toBeNull();
      }
    }
  });
});

/** Recursively collects every value found under any of `keys`, anywhere in `value`. */
function collectByKey(value: unknown, keys: readonly string[], out: unknown[] = []): unknown[] {
  if (Array.isArray(value)) {
    for (const item of value) collectByKey(item, keys, out);
  } else if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (keys.includes(k)) out.push(v);
      collectByKey(v, keys, out);
    }
  }
  return out;
}

describe("synthetic-value guard", () => {
  const allCases = allFixtureSets.flatMap((set) => set.cases);

  it("every fixture set is marked evidence: synthetic", () => {
    for (const set of allFixtureSets) {
      expect(set.evidence).toBe("synthetic");
    }
  });

  it("no case's tenant preset (or any `when` value) is literally 'demo'", () => {
    for (const demoCase of allCases) {
      const tenantPreset = demoCase.preset.tenant;
      if (tenantPreset !== undefined) {
        expect(tenantPreset.toLowerCase(), `${demoCase.id}.preset.tenant`).not.toBe("demo");
      }
      const tenantWhen = demoCase.when.tenant;
      if (Array.isArray(tenantWhen)) {
        for (const v of tenantWhen) expect(v.toLowerCase(), `${demoCase.id}.when.tenant`).not.toBe("demo");
      }
    }
  });

  it("every phone/DID number field uses the reserved fictional NANP exchange 555", () => {
    const phoneFields = [
      "di_number",
      "sc_calleridnum",
      "sc_dialednum",
      "callerid",
      // Phase 8 Stage 3 (MiRTA OpenAPI):
      "ai_callerid",
      "Extension",
      "OtherParty",
      "Connected Line ID",
    ] as const;
    for (const demoCase of allCases) {
      const values = collectByKey(demoCase.response.body, phoneFields);
      for (const v of values) {
        if (typeof v !== "string" || v === "") continue;
        // Internal extension numbers (e.g. "201") can legitimately appear in
        // sc_calleridnum/sc_dialednum for internal calls; only external-length
        // numbers are expected to fall in the fictional 555 exchange. One case
        // (no-match) deliberately uses a 555 number outside the matched
        // records' narrower 55501xx sub-block, to demonstrate a non-match.
        if (v.length < 7) continue;
        expect(v, `${demoCase.id} phone-like field`).toMatch(/^555\d+$/);
      }
      const presetPhone = demoCase.preset.phone;
      if (presetPhone) expect(presetPhone, `${demoCase.id}.preset.phone`).toMatch(/^555\d+$/);
    }
  });

  it("no value from the real observed evidence (source-docs/observed/info-extensions.json) appears in any fixture body", () => {
    const realIds = Object.keys(observedInfoExtensions.response); // e.g. "3272", "155450", "169430" — real internal ids, not reused anywhere as extension numbers
    const serialized = JSON.stringify(allCases.map((c) => c.response.body));
    for (const id of realIds) {
      expect(serialized, `real ex_id ${id} must not leak into Demo fixtures`).not.toContain(`"${id}"`);
    }
    // The redacted-name placeholders themselves are not sensitive, but their
    // presence would indicate the evidence file was copied rather than
    // fabricated from scratch.
    expect(serialized).not.toMatch(/REDACTED_NAME/);
  });
});
