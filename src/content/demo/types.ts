/**
 * Demo fixture model (Phase 6, docs/ARCHITECTURE.md "Demo provider").
 *
 * A fixture set attaches synthetic, replayable responses to one endpoint of
 * a non-synthetic API (`ApiDefinition.synthetic === false`), without
 * changing that endpoint's own `responses` field — those stay
 * `evidence: "observed-sanitized"` or `"vendor"` and are never replayed
 * (types.ts `Evidence`). Every value here is `evidence: "synthetic"` by
 * construction: fabricated data that merely mirrors an observed shape.
 *
 * Cases are matched in order; the first whose `when` matches every query
 * parameter wins. A parameter absent from `when` is a bug (enforced by
 * tests/unit/demo-fixtures.test.ts's exhaustiveness check), not an
 * implicit wildcard — every endpoint query parameter must appear in every
 * case, either as `"*"` (any value, including empty) or as an explicit
 * list of accepted values (`[""]` means "must be empty/omitted").
 * No match means the input combination was never observed: the Playground
 * shows "Not simulated", never a guess.
 */

export interface DemoCase {
  id: string;
  /** Shown on the scenario chip and the response's "Scenario" line. English only (content language decision, Phase 4). */
  label: string;
  /** One line citing the DOCS_AUDIT.md finding this case reproduces. */
  basis: string;
  /** Every query parameter of the endpoint must have an entry. */
  when: Readonly<Record<string, "*" | readonly string[]>>;
  /** Query values a scenario chip fills in. Need not cover every param — only the ones worth setting. */
  preset: Readonly<Record<string, string>>;
  response: {
    status: number;
    format: "json" | "text";
    contentType: string;
    body: unknown;
  };
}

export interface DemoFixtureSet {
  /** `${api}/${endpoint}`, matching the Live target id convention (playground-protocol.ts). */
  endpoint: `${string}/${string}`;
  evidence: "synthetic";
  cases: readonly DemoCase[];
}
