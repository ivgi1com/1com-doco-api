import { describe, expect, it } from "vitest";
import { normalizeBasePath } from "@/lib/base-path";

describe("normalizeBasePath", () => {
  it("treats unset, empty and root as no base path", () => {
    expect(normalizeBasePath(undefined)).toBe("");
    expect(normalizeBasePath("")).toBe("");
    expect(normalizeBasePath("  ")).toBe("");
    expect(normalizeBasePath("/")).toBe("");
  });

  it("accepts a leading-slash path without trailing slash", () => {
    expect(normalizeBasePath("/1com-api-doco")).toBe("/1com-api-doco");
    expect(normalizeBasePath("/apps/docs")).toBe("/apps/docs");
  });

  it("rejects malformed values instead of building broken URLs", () => {
    for (const bad of ["1com-api-doco", "/1com-api-doco/", "//x", "/a b", "/a?b", "https://x/y"]) {
      expect(() => normalizeBasePath(bad), bad).toThrow(/NEXT_PUBLIC_BASE_PATH/);
    }
  });
});
