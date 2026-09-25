import "server-only";

export interface LiveLogEntry {
  /** Allowlisted target id, or "unknown" — never the caller's raw string. */
  endpoint: string;
  outcome: string;
  status?: number;
  latencyMs?: number;
  sizeBytes?: number;
}

/**
 * The only telemetry the Live proxy emits. The entry type has no field for
 * parameters, tenant, credential, URL, or headers, so none can be logged by
 * accident (CLAUDE.md §7).
 */
export function logLive(entry: LiveLogEntry, sink: (line: string) => void = console.info) {
  const { endpoint, outcome, status, latencyMs, sizeBytes } = entry;
  sink(JSON.stringify({ evt: "playground.live", endpoint, outcome, status, latencyMs, sizeBytes }));
}
