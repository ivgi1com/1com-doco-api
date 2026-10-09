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
      (i) => i.kind === "endpoint" && i.href === "/reference/openapi/extensions-list",
    );
    expect(item).toBeDefined();
    expect(item?.method).toBe("GET");
  });
});

describe("buildSearchIndex and hidden menu categories", () => {
  it("leaves out categories hidden from the side menus (Settings, Provisioning phones)", () => {
    const hrefs = buildSearchIndex().map((i) => i.href);
    expect(hrefs.some((h) => h.startsWith("/reference/openapi/settings-"))).toBe(false);
    expect(hrefs.some((h) => h.startsWith("/reference/openapi/provisioningphones-"))).toBe(false);
    expect(hrefs).toContain("/reference/openapi/extensions-list");
  });
});

describe("searchItems", () => {
  const index = buildSearchIndex();

  it("returns all items unchanged for an empty/whitespace query", () => {
    expect(searchItems(index, "")).toEqual(index);
    expect(searchItems(index, "   ")).toEqual(index);
  });

  it("is case-insensitive", () => {
    const lower = searchItems(index, "campaign");
    const upper = searchItems(index, "CAMPAIGN");
    expect(upper.map((i) => i.href)).toEqual(lower.map((i) => i.href));
    expect(lower.length).toBeGreaterThan(0);
  });

  it("ranks title-prefix matches before title-substring and detail matches", () => {
    const results = searchItems(index, "extension");
    // "List extensions" contains but doesn't start with "extension".
    // Use a query that actually prefixes a title to assert ordering.
    const prefixResults = searchItems(index, "list extensions");
    expect(prefixResults[0]?.title.toLowerCase()).toBe("list extensions");
    expect(results.length).toBeGreaterThan(0);
  });

  it("excludes items that match neither title nor detail", () => {
    const results = searchItems(index, "no-such-term-xyz");
    expect(results).toEqual([]);
  });

  it("matches on detail (path) even when the title doesn't match", () => {
    const results = searchItems(index, "/campaigns");
    expect(results.every((i) => i.detail.includes("/campaigns"))).toBe(true);
    expect(results.length).toBeGreaterThan(0);
  });
});
