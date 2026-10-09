"use client";

import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";
import { CategoryGroups } from "@/components/shell/category-groups";
import { LifecycleBadge } from "@/components/ui/lifecycle-badge";
import { MethodBadge } from "@/components/ui/method-badge";
import { apis, menuGroups } from "@/content";
import type { ApiDefinition, Endpoint } from "@/content/types";

export function EndpointPicker({
  api,
  selected,
  onSelect,
  onSelectApi,
}: {
  api: ApiDefinition;
  selected: Endpoint;
  onSelect: (endpoint: Endpoint) => void;
  onSelectApi: (apiId: string) => void;
}) {
  const t = useTranslations("playground");
  const tn = useTranslations("nav");
  const [query, setQuery] = useState("");
  const filtering = query.trim() !== "";
  const filterId = useId();
  const apiSelectId = useId();

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = (e: { title: string; path: string }) =>
      !q || e.title.toLowerCase().includes(q) || e.path.toLowerCase().includes(q);
    return menuGroups(api)
      .map((group) => ({
        ...group,
        categories: group.categories
          .map((category) => ({ ...category, endpoints: category.endpoints.filter(matches) }))
          .filter((c) => c.endpoints.length > 0),
      }))
      .filter((g) => g.categories.length > 0);
  }, [api, query]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-3">
        <label htmlFor={apiSelectId} className="mb-1.5 block text-xs font-semibold text-ink-muted">
          {t("api")}
        </label>
        <select
          id={apiSelectId}
          value={api.id}
          onChange={(e) => onSelectApi(e.target.value)}
          className="mb-3 h-8 w-full min-w-0 rounded-md border border-border-control bg-bg px-2 text-sm font-semibold text-ink"
        >
          {apis.map((a) => (
            <option key={a.id} value={a.id}>
              {a.legacy ? tn("legacyApi", { name: a.name }) : a.name}
            </option>
          ))}
        </select>
        <label htmlFor={filterId} className="mb-1.5 block text-xs font-semibold text-ink-muted">
          {t("endpoints")}
        </label>
        <input
          id={filterId}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("filter")}
          className="h-8 w-full rounded-md border border-border-control bg-bg px-2.5 text-sm text-ink placeholder:text-ink-muted"
        />
      </div>
      <nav aria-label={t("endpoints")} className="min-h-0 flex-1 overflow-y-auto p-2">
        <CategoryGroups
          groups={groups}
          activeEndpointId={selected.id}
          forceOpen={filtering}
          renderEndpoint={(endpoint) => (
            <button
              type="button"
              aria-current={endpoint.id === selected.id ? "true" : undefined}
              onClick={() => onSelect(endpoint)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start text-sm text-ink-muted transition-colors duration-150 hover:bg-surface-2 hover:text-ink aria-[current]:bg-accent-tint aria-[current]:font-semibold aria-[current]:text-accent"
            >
              <MethodBadge method={endpoint.method} size="sm" />
              <span className="min-w-0 flex-1 truncate">{endpoint.title}</span>
              {endpoint.status !== "stable" && <LifecycleBadge status={endpoint.status} compact />}
            </button>
          )}
        />
      </nav>
    </div>
  );
}
