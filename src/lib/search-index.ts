import { apis, listEndpoints } from "@/content";
import { guides } from "@/content/guides";
import type { HttpMethod } from "@/content/types";

export interface SearchItem {
  kind: "endpoint" | "guide";
  title: string;
  detail: string;
  href: string;
  method?: HttpMethod;
}

export function buildSearchIndex(): SearchItem[] {
  const endpoints: SearchItem[] = apis.flatMap((api) =>
    listEndpoints(api).map((e) => ({
      kind: "endpoint" as const,
      title: e.title,
      detail: e.path,
      href: `/reference/${api.id}/${e.id}`,
      method: e.method,
    })),
  );
  const guideItems: SearchItem[] = guides.map((g) => ({
    kind: "guide",
    title: g.title,
    detail: g.summary,
    href: `/guides/${g.slug}`,
  }));
  return [...endpoints, ...guideItems];
}

/** Case-insensitive match on title and detail; title hits rank first. */
export function searchItems(items: SearchItem[], query: string): SearchItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  const scored = items
    .map((item) => {
      const title = item.title.toLowerCase();
      const detail = item.detail.toLowerCase();
      const score = title.startsWith(q) ? 0 : title.includes(q) ? 1 : detail.includes(q) ? 2 : -1;
      return { item, score };
    })
    .filter((s) => s.score >= 0);
  return scored.sort((a, b) => a.score - b.score).map((s) => s.item);
}
