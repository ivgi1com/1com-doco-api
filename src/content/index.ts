import { openapiApi } from "./openapi";
import { proxyApi } from "./proxy";
import { sampleApi } from "./sample-api";
import type { ApiDefinition, Category, Endpoint } from "./types";

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

/** Categories for the side menus: `menuHidden` removed, `menuOrder` ids first, the rest in their own order. */
export function menuCategories(api: ApiDefinition): Category[] {
  const hidden = new Set(api.menuHidden);
  const order = api.menuOrder ?? [];
  const rank = (c: Category) => {
    const i = order.indexOf(c.id);
    return i === -1 ? order.length : i;
  };
  return api.categories
    .filter((c) => !hidden.has(c.id))
    .map((c, index) => ({ c, index }))
    .sort((a, b) => rank(a.c) - rank(b.c) || a.index - b.index)
    .map(({ c }) => c);
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
