import "server-only";
import type { RenderedSample } from "@/components/code/code-tabs";
import { listEndpoints } from "@/content";
import type { ApiDefinition } from "@/content/types";
import { buildSamples } from "./endpoint-panel";

/** Pre-renders request code samples for every endpoint of an API, keyed by endpoint id. */
export async function buildPlaygroundSamples(api: ApiDefinition): Promise<Record<string, RenderedSample[]>> {
  const entries = await Promise.all(
    listEndpoints(api).map(async (endpoint) => [endpoint.id, await buildSamples(api, endpoint)] as const),
  );
  return Object.fromEntries(entries);
}
