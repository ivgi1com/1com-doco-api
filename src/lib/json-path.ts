export type PathSegment = string | number;

const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

/** Formats a JSONPath-style string, e.g. `$.data[0].extension.number`. */
export function formatJsonPath(segments: PathSegment[]): string {
  return segments.reduce<string>((acc, seg) => {
    if (typeof seg === "number") return `${acc}[${seg}]`;
    return IDENTIFIER.test(seg) ? `${acc}.${seg}` : `${acc}[${JSON.stringify(seg)}]`;
  }, "$");
}

export function byteSize(value: unknown): number {
  return new TextEncoder().encode(JSON.stringify(value)).length;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}
