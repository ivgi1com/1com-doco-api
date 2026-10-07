import { describe, expect, it } from "vitest";
import { apis, listEndpoints } from "@/content";
import { composeDateValue, defaultTimeFor, parseDateValue } from "@/lib/date-value";

describe("parseDateValue", () => {
  it("accepts empty, and the documented formats", () => {
    expect(parseDateValue("", "date")).toEqual({ date: "", time: "" });
    expect(parseDateValue("  ", "datetime")).toEqual({ date: "", time: "" });
    expect(parseDateValue("2026-01-31", "date")).toEqual({ date: "2026-01-31", time: "" });
    expect(parseDateValue("2026-01-01 23:59:59", "datetime")).toEqual({ date: "2026-01-01", time: "23:59:59" });
  });

  it("returns null for anything else, so the field stays plain text and nothing is rewritten", () => {
    for (const v of ["2026-1-1", "2026-01-01 00:00", "2026-01-01T00:00:00", "today", "2026-01-01 00:00:00 UTC", "01/02/2026"]) {
      expect(parseDateValue(v, "datetime"), v).toBeNull();
    }
    expect(parseDateValue("2026-01-01 00:00:00", "date")).toBeNull();
    expect(parseDateValue("2026-01-01", "datetime")).toBeNull();
  });
});

describe("composeDateValue", () => {
  it("writes exactly the documented string, with no timezone or reformatting", () => {
    expect(composeDateValue({ date: "2026-01-31", time: "" }, "date")).toBe("2026-01-31");
    expect(composeDateValue({ date: "2026-01-01", time: "09:05:07" }, "datetime")).toBe("2026-01-01 09:05:07");
  });

  it("applies the documented default time when only a date is chosen", () => {
    expect(composeDateValue({ date: "2026-01-01", time: "" }, "datetime", defaultTimeFor("start"))).toBe("2026-01-01 00:00:00");
    expect(composeDateValue({ date: "2026-01-01", time: "" }, "datetime", defaultTimeFor("end"))).toBe("2026-01-01 23:59:59");
  });

  it("is empty with no date, and round-trips through parse", () => {
    expect(composeDateValue({ date: "", time: "10:00:00" }, "datetime")).toBe("");
    for (const [v, f] of [["2026-01-31", "date"], ["2026-01-01 23:59:59", "datetime"]] as const) {
      expect(composeDateValue(parseDateValue(v, f)!, f)).toBe(v);
    }
  });
});

describe("Parameter.format in the content model", () => {
  const tagged = apis.flatMap((a) =>
    listEndpoints(a).flatMap((e) =>
      [...e.queryParameters, ...e.pathParameters, ...(e.requestBody ?? [])]
        .filter((p) => p.format)
        .map((p) => ({ id: `${a.id}/${e.id}`, p })),
    ),
  );

  it("is set on the documented start/end fields and nowhere else (no invented formats)", () => {
    const ids = tagged.map((t) => `${t.id}:${t.p.name}:${t.p.format}`).sort();
    expect(ids).toEqual(
      [
        "openapi/ailogs-list:start:datetime",
        "openapi/ailogs-list:end:datetime",
        "openapi/cdrs-list:start:datetime",
        "openapi/cdrs-list:end:datetime",
        "openapi/simplecdrs-list:start:datetime",
        "openapi/simplecdrs-list:end:datetime",
        "proxy/info-cdrs:start:date",
        "proxy/info-cdrs:end:date",
        "proxy/info-queuelogs:start:date",
        "proxy/info-queuelogs:end:date",
        "proxy/info-simplecdrs:start:date",
        "proxy/info-simplecdrs:end:date",
      ].sort(),
    );
  });

  it("every tagged field's own example parses in its declared format", () => {
    for (const { id, p } of tagged) {
      expect(parseDateValue(String(p.example), p.format!), `${id} ${p.name}`).not.toBeNull();
    }
  });
});
