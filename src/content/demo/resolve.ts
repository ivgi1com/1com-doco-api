import type { DemoCase, DemoFixtureSet } from "./types";

/**
 * First case whose `when` matches every entry of `params`, or `null` when
 * none does (shown by the Playground as "Not simulated"). `params` is
 * expected to be the output of `liveQueryParams` — only non-empty, trimmed
 * values — so a parameter this function doesn't find in `params` is treated
 * as `""`, matching how an omitted/cleared field behaves for real.
 */
export function resolveDemoCase(set: DemoFixtureSet | undefined, params: Record<string, string>): DemoCase | null {
  if (!set) return null;
  for (const demoCase of set.cases) {
    let matches = true;
    for (const [name, allowed] of Object.entries(demoCase.when)) {
      if (allowed === "*") continue;
      const value = params[name]?.trim() ?? "";
      if (!allowed.includes(value)) {
        matches = false;
        break;
      }
    }
    if (matches) return demoCase;
  }
  return null;
}
