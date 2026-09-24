import { sampleApi } from "./sample-api";
import type { ApiDefinition, Endpoint } from "./types";

export const apis: ApiDefinition[] = [sampleApi];

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
