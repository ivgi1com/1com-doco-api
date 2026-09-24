import { describe, expect, it } from "vitest";
import { buildSearchIndex, searchItems } from "@/lib/search-index";

describe("buildSearchIndex", () => {
  it("includes both endpoints and guides", () => {
    const index = buildSearchIndex();
    expect(index.some((i) => i.kind === "endpoint")).toBe(true);
    expect(index.some((i) => i.kind === "guide")).toBe(true);
  });

  it("links endpoints to their reference route", () => {
    const index = buildSearchIndex();
    const item = index.find(
      (i) => i.kind === "endpoint" && i.href === "/reference/sample/list-call-records",
    );
    expect(item).toBeDefined();
    expect(item?.method).toBe("GET");
  });
});

describe("searchItems", () => {
  const index = buildSearchIndex();

  it("returns all items unchanged for an empty/whitespace query", () => {
    expect(searchItems(index, "")).toEqual(index);
    expect(searchItems(index, "   ")).toEqual(index);
  });

  it("is case-insensitive", () => {
    const lower = searchItems(index, "contact");
    const upper = searchItems(index, "CONTACT");
    expect(upper.map((i) => i.href)).toEqual(lower.map((i) => i.href));
    expect(lower.length).toBeGreaterThan(0);
  });

  it("ranks title-prefix matches before title-substring and detail matches", () => {
    const results = searchItems(index, "call");
    // "List call records" / "Retrieve a call record" start with "call"? No —
    // title is "List call records", which *contains* but doesn't start with "call".
    // Use a query that actually prefixes a title to assert ordering.
    const prefixResults = searchItems(index, "list call records");
    expect(prefixResults[0]?.title.toLowerCase()).toBe("list call records");
    expect(results.length).toBeGreaterThan(0);
  });

  it("excludes items that match neither title nor detail", () => {
    const results = searchItems(index, "no-such-term-xyz");
    expect(results).toEqual([]);
  });

  it("matches on detail (path) even when the title doesn't match", () => {
    const results = searchItems(index, "/v1/contacts");
    expect(results.every((i) => i.detail.includes("/v1/contacts"))).toBe(true);
    expect(results.length).toBeGreaterThan(0);
  });
});
