import { describe, expect, it } from "vitest";
import { getLiveTarget } from "@/server/playground/allowlist";
import { projectJsonFields, REDACTED, redactSensitive, WITHHELD } from "@/server/playground/redact";
import { getEndpoint } from "@/content";
import { validateLiveRequest } from "@/server/playground/validate";

// Synthetic fixtures shaped like the observed A-40 output; no real data.
const SECRET = "s3cr3t-SIP-pw";

describe("redactSensitive — plain pipe table (observed default format, A-40)", () => {
  const header = "Number|Name|Tech|State|Username|Password";

  it("replaces non-empty Password cells and counts them", () => {
    const input = `${header}\n201|Ext A|SIP|UNAVAILABLE|201-t|${SECRET}\n300|Ext B|SIP|UNAVAILABLE|300-t|\n`;
    const r = redactSensitive(input);
    expect(r.redacted).toBe(1);
    expect(r.text).not.toContain(SECRET);
    expect(r.text).toBe(`${header}\n201|Ext A|SIP|UNAVAILABLE|201-t|${REDACTED}\n300|Ext B|SIP|UNAVAILABLE|300-t|\n`);
  });

  it("leaves a table with only empty passwords unchanged", () => {
    const input = `${header}\n201|Ext A|SIP|UNAVAILABLE|201-t|\n`;
    expect(redactSensitive(input)).toEqual({ text: input, redacted: 0 });
  });

  it("fails closed when a row doesn't align with the header", () => {
    const input = `${header}\n201|Ext|with|pipe|SIP|UNAVAILABLE|201-t|${SECRET}\n`;
    expect(redactSensitive(input)).toEqual({ text: WITHHELD, redacted: -1 });
  });

  it("fails closed on quoted CSV data (delimiter may hide inside quotes)", () => {
    const input = `number,name,password\n201,"Doe, Jane",${SECRET}\n`;
    expect(redactSensitive(input)).toEqual({ text: WITHHELD, redacted: -1 });
  });

  it("handles unquoted CSV and tab-separated tables", () => {
    expect(redactSensitive(`number,secret\n201,${SECRET}\n`).text).not.toContain(SECRET);
    expect(redactSensitive(`number\tpwd\n201\t${SECRET}\n`).text).not.toContain(SECRET);
  });

  it("passes through text with no sensitive column", () => {
    const input = "Number|Name\n201|Ext A\n";
    expect(redactSensitive(input)).toEqual({ text: input, redacted: 0 });
  });
});

describe("redactSensitive — JSON", () => {
  it("redacts sensitive keys at any depth, case-insensitively", () => {
    const input = JSON.stringify({
      "1": { ex_id: "1", ex_password: SECRET, nested: { SipSecret: SECRET, ok: "x" } },
      list: [{ Password: SECRET }],
    });
    const r = redactSensitive(input);
    expect(r.redacted).toBe(3);
    expect(r.text).not.toContain(SECRET);
    expect(JSON.parse(r.text)["1"].nested.ok).toBe("x");
  });

  it("redacts a whole container under a sensitive key", () => {
    const r = redactSensitive(JSON.stringify({ credentials: 1, secret: { value: SECRET } }));
    expect(r.text).not.toContain(SECRET);
  });

  it("returns the original text untouched when nothing is sensitive", () => {
    const input = '{"1": {"ex_id": "1", "ex_name": "A"}}';
    expect(redactSensitive(input)).toEqual({ text: input, redacted: 0 });
  });
});

describe("redactSensitive — XML", () => {
  it("redacts sensitive element text and attributes", () => {
    const input = `<exts><ext id="1" password="${SECRET}"><name>A</name><Password>${SECRET}</Password></ext></exts>`;
    const r = redactSensitive(input);
    expect(r.text).not.toContain(SECRET);
    expect(r.redacted).toBe(2);
  });

  it("fails closed on a sensitive element containing markup (e.g. CDATA)", () => {
    const input = `<ext><password><![CDATA[${SECRET}]]></password></ext>`;
    expect(redactSensitive(input)).toEqual({ text: WITHHELD, redacted: -1 });
  });
});

describe("format parameter (A-40 decision)", () => {
  const base = { endpoint: "proxy/info-extensions", credential: "k", params: { tenant: "t" } };

  it("is allowlisted with exactly the documented values", () => {
    // xml/csv returned empty bodies for this operation (A-40) and were removed.
    expect([...getLiveTarget("proxy/info-extensions")!.paramEnums.get("format")!].sort()).toEqual(["json", "plain"]);
  });

  it.each(["plain", "json"])("accepts format=%s", (format) => {
    expect(validateLiveRequest({ ...base, params: { tenant: "t", format } }).ok).toBe(true);
  });

  it.each(["xml", "csv", "jsonp", "JSON", "json&callback=x", "html"])("rejects format=%s", (format) => {
    expect(validateLiveRequest({ ...base, params: { tenant: "t", format } })).toEqual({ ok: false, code: "invalid_request" });
  });

  it("still rejects the JSONP callback param", () => {
    expect(validateLiveRequest({ ...base, params: { tenant: "t", callback: "x" } }).ok).toBe(false);
  });
});

describe("2FA / PIN fields observed in format=json (A-40)", () => {
  it("redacts ex_2fa_param*, ex_lockpin, ex_webpassword and password; keeps ex_pinlocked-style flags only if empty", () => {
    const item = {
      ex_id: "1",
      ex_2fa_param1: "JBSWY3DPEHPK3PXP",
      ex_2fa_param2: "x",
      ex_lockpin: "1234",
      ex_webpassword: "w",
      password: "p",
      ex_mapping: "kept",
    };
    const r = redactSensitive(JSON.stringify([item]));
    const out = JSON.parse(r.text)[0];
    expect(out.ex_2fa_param1).toBe(REDACTED);
    expect(out.ex_2fa_param2).toBe(REDACTED);
    expect(out.ex_lockpin).toBe(REDACTED);
    expect(out.ex_webpassword).toBe(REDACTED);
    expect(out.password).toBe(REDACTED);
    expect(out.ex_mapping).toBe("kept");
  });
});

describe("projectJsonFields — JSON field allowlist (A-40)", () => {
  const allowed = new Set(["ex_id", "ex_name"]);

  it("keeps only allowlisted fields of each array item and counts distinct drops", () => {
    const r = projectJsonFields(JSON.stringify([{ ex_id: "1", ex_name: "A", ex_email: "e", ex_2fa_param1: "s" }, { ex_id: "2", ex_notes: "n" }]), allowed);
    expect(JSON.parse(r.text)).toEqual([{ ex_id: "1", ex_name: "A" }, { ex_id: "2" }]);
    expect(r.omittedFields).toBe(3);
    expect(r.withheld).toBe(false);
  });

  it("handles the keyed-object shape too", () => {
    const r = projectJsonFields(JSON.stringify({ "1": { ex_id: "1", secret: "s" } }), allowed);
    expect(JSON.parse(r.text)).toEqual({ "1": { ex_id: "1" } });
  });

  it.each([
    ["a bare object", { ex_id: "1", password: "p" }],
    ["an array of scalars", ["p", "q"]],
    ["mixed array", [{ ex_id: "1" }, "p"]],
  ])("withholds any other JSON shape: %s", (_label, value) => {
    expect(projectJsonFields(JSON.stringify(value), allowed)).toEqual({ text: WITHHELD, omittedFields: 0, withheld: true });
  });

  it("leaves non-JSON (the plain table) for redactSensitive", () => {
    const t = "Number|Name|Password\n1|A|p\n";
    expect(projectJsonFields(t, allowed)).toEqual({ text: t, omittedFields: 0, withheld: false });
  });

  it("the Live allowlist matches the documented response schema exactly", () => {
    const endpoint = getEndpoint("proxy", "info-extensions")!;
    const documented = endpoint.responses[0].schema![0].children!.map((c) => c.name).sort();
    expect([...getLiveTarget("proxy/info-extensions")!.jsonFields].sort()).toEqual(documented);
  });
});
