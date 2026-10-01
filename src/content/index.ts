import { openapiApi } from "./openapi";
import { proxyApi } from "./proxy";
import { sampleApi } from "./sample-api";
import type { ApiDefinition, Endpoint } from "./types";

/**
 * 1com Open API first (`apis[0]` is the default, Phase 8E), then the legacy
 * Proxy API. The Sample API stays last as prototype/design reference.
 */
export const apis: ApiDefinition[] = [openapiApi, proxyApi, sampleApi];

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

/** The endpoint the Playground opens on for an API: its `defaultEndpoint`, else the first one. */
export function defaultEndpoint(api: ApiDefinition): Endpoint {
  const endpoints = listEndpoints(api);
  return endpoints.find((e) => e.id === api.defaultEndpoint) ?? endpoints[0];
}

export type { ApiDefinition, Endpoint } from "./types";
