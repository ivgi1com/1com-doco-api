import { openapiApi } from "./openapi";
import { proxyApi } from "./proxy";
import type { ApiDefinition, Category, Endpoint, MenuGroup } from "./types";

/**
 * 1com Open API first (`apis[0]` is the default, Phase 8E), then the legacy
 * Proxy API.
 */
export const apis: ApiDefinition[] = [openapiApi, proxyApi];

export function getApi(apiId: string): ApiDefinition | undefined {
  return apis.find((api) => api.id === apiId);
}

export function listEndpoints(api: ApiDefinition): Endpoint[] {
  return api.categories.flatMap((category) => category.endpoints);
}

function orderedCategories(api: ApiDefinition, includeHidden: boolean): Category[] {
  const hidden = new Set(includeHidden ? [] : api.menuHidden);
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

/** Categories for the side menus: `menuHidden` removed, `menuOrder` ids first, the rest in their own order. */
export function menuCategories(api: ApiDefinition): Category[] {
  return orderedCategories(api, false);
}

/**
 * Side-menu entries: `menuCategories` order, with each `menuGroups` entry
 * folded into one group at the place of its first visible member (in the
 * group's own order). Members keep
 * the group's own order; an all-hidden group disappears. `includeHidden` keeps
 * `menuHidden` categories (the overview page lists every category).
 */
export function menuGroups(api: ApiDefinition, { includeHidden = false } = {}): MenuGroup[] {
  const ordered = orderedCategories(api, includeHidden);
  const byId = new Map(ordered.map((c) => [c.id, c]));
  const groupOf = new Map<string, { title: string; categories: Category[] }>();
  for (const def of api.menuGroups ?? []) {
    const members = def.categories.flatMap((id) => byId.get(id) ?? []);
    for (const id of def.categories) groupOf.set(id, { title: def.title, categories: members });
  }
  const out: MenuGroup[] = [];
  for (const category of ordered) {
    const group = groupOf.get(category.id);
    if (!group) out.push({ id: category.id, title: category.title, categories: [category] });
    else if (group.categories[0] === category) out.push({ id: category.id, title: group.title, categories: group.categories });
  }
  return out;
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

export type { ApiDefinition, Endpoint, MenuGroup } from "./types";
