import "server-only";
import type { RenderedSample } from "@/components/code/code-tabs";
import { listEndpoints } from "@/content";
import type { ApiDefinition } from "@/content/types";
import { buildSamples } from "./endpoint-panel";

async function buildPlaygroundSamplesUncached(api: ApiDefinition): Promise<Record<string, RenderedSample[]>> {
  const entries = await Promise.all(
    listEndpoints(api).map(async (endpoint) => [endpoint.id, await buildSamples(api, endpoint)] as const),
  );
  return Object.fromEntries(entries);
}

const cache = new Map<string, Promise<Record<string, RenderedSample[]>>>();

/**
 * Pre-renders request code samples for every endpoint of an API, keyed by
 * endpoint id. `apis` is static module data, so this never changes within a
 * running process; cached per api id (like `getSearchIndex()`) so the
 * Playground page — which every endpoint's "Try in Playground" link
 * prefetches — doesn't redo every language's shiki highlighting on each
 * request.
 */
export function buildPlaygroundSamples(api: ApiDefinition): Promise<Record<string, RenderedSample[]>> {
  let cached = cache.get(api.id);
  if (!cached) {
    cached = buildPlaygroundSamplesUncached(api);
    cache.set(api.id, cached);
  }
  return cached;
}
