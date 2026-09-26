import { openapiApi } from "./openapi";
import { proxyApi } from "./proxy";
import { sampleApi } from "./sample-api";
import type { ApiDefinition, Endpoint } from "./types";

/**
 * Proxy API first (real content, Phase 4; `apis[0]` is the default), then
 * MiRTA OpenAPI (Phase 8). The Sample API stays as prototype/design reference.
 */
export const apis: ApiDefinition[] = [proxyApi, openapiApi, sampleApi];

export function getApi(apiId: string): ApiDefinition | undefined {
  return apis.find((api) => api.id === apiId);
}

export function listEndpoints(api: ApiDefinition): Endpoint[] {
  return api.categories.flatMap((category) => category.endpoints);
}

export function getEndpoint(apiId: string, endpointId: string): Endpoint | undefined {
  const api = getApi(apiId);
  return api ? listEndpoints(api).find((e) => e.id === endpointId) : undefined;
}

export type { ApiDefinition, Endpoint } from "./types";
