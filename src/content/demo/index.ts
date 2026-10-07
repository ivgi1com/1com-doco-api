import { openapiDemoFixtures } from "./openapi";
import { proxyDemoFixtures } from "./proxy";
import type { Endpoint } from "../types";
import type { DemoFixtureSet } from "./types";

const allFixtures: readonly DemoFixtureSet[] = [...proxyDemoFixtures, ...openapiDemoFixtures];

const byEndpoint = new Map<string, DemoFixtureSet>(allFixtures.map((set) => [set.endpoint, set]));

/** The fixture set for one endpoint, or `undefined` when it has none (falls back to `api.synthetic` behavior — see executor.ts `demoProvider`). */
export function getDemoFixtures(apiId: string, endpointId: string): DemoFixtureSet | undefined {
  return byEndpoint.get(`${apiId}/${endpointId}`);
}

/**
 * APIs whose write operations may be simulated in Demo (SEC-REQ-27, as
 * amended 2026-10-01): only from a fixture set built from the vendor's
 * documented examples, never sent anywhere. Every other API's writes stay
 * Reference-only, even if a fixture set were added by mistake.
 */
export const DEMO_WRITE_APIS: ReadonlySet<string> = new Set(["openapi"]);

/** True only for a write on a DEMO_WRITE_APIS API that has its own fixture set. Live never sends a write regardless. */
export function isDemoSimulatedWrite(apiId: string, endpoint: Pick<Endpoint, "id" | "operationClass">): boolean {
  return (
    endpoint.operationClass === "write" && DEMO_WRITE_APIS.has(apiId) && getDemoFixtures(apiId, endpoint.id) !== undefined
  );
}

export type { DemoCase, DemoFixtureSet } from "./types";
export { resolveDemoCase } from "./resolve";
