import { describe, expect, it } from "vitest";
import { formatJsonPath, byteSize, formatBytes } from "@/lib/json-path";

describe("formatJsonPath", () => {
  it("formats a plain identifier chain", () => {
    expect(formatJsonPath(["data", "extension", "number"])).toBe(
      "$.data.extension.number",
    );
  });

  it("formats array indices with bracket notation", () => {
    expect(formatJsonPath(["data", 0, "extension"])).toBe("$.data[0].extension");
  });

  it("quotes segments that are not valid identifiers", () => {
    expect(formatJsonPath(["data", "next-cursor"])).toBe('$.data["next-cursor"]');
  });

  it("returns the root for an empty path", () => {
    expect(formatJsonPath([])).toBe("$");
  });
});

describe("byteSize", () => {
  it("measures the UTF-8 byte length of the JSON encoding", () => {
    expect(byteSize({ a: 1 })).toBe(new TextEncoder().encode('{"a":1}').length);
  });

  it("counts multi-byte characters correctly", () => {
    // "café" -> "caf" (3 bytes) + é (2 bytes in UTF-8) = 5, plus JSON quotes.
    expect(byteSize("café")).toBe(new TextEncoder().encode('"café"').length);
  });
});

describe("formatBytes", () => {
  it("keeps sub-KB values in bytes", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(1023)).toBe("1023 B");
  });

  it("switches to KB at 1024 bytes with one decimal place", () => {
    expect(formatBytes(1024)).toBe("1.0 KB");
    expect(formatBytes(1536)).toBe("1.5 KB");
  });
});
