import { proxyDemoFixtures } from "./proxy";
import type { DemoFixtureSet } from "./types";

const allFixtures: readonly DemoFixtureSet[] = [...proxyDemoFixtures];

const byEndpoint = new Map<string, DemoFixtureSet>(allFixtures.map((set) => [set.endpoint, set]));

/** The fixture set for one endpoint, or `undefined` when it has none (falls back to `api.synthetic` behavior — see executor.ts `demoProvider`). */
export function getDemoFixtures(apiId: string, endpointId: string): DemoFixtureSet | undefined {
  return byEndpoint.get(`${apiId}/${endpointId}`);
}

export type { DemoCase, DemoFixtureSet } from "./types";
export { resolveDemoCase } from "./resolve";
