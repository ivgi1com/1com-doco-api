"use client";

import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";
import { LifecycleBadge } from "@/components/ui/lifecycle-badge";
import { MethodBadge } from "@/components/ui/method-badge";
import type { ApiDefinition, Endpoint } from "@/content/types";

export function EndpointPicker({
  api,
  selected,
  onSelect,
}: {
  api: ApiDefinition;
  selected: Endpoint;
  onSelect: (endpoint: Endpoint) => void;
}) {
  const t = useTranslations("playground");
  const [query, setQuery] = useState("");
  const filterId = useId();

  const categories = useMemo(() => {
    const q = query.trim().toLowerCase();
    return api.categories
      .map((category) => ({
        ...category,
        endpoints: category.endpoints.filter(
          (e) => !q || e.title.toLowerCase().includes(q) || e.path.toLowerCase().includes(q),
        ),
      }))
      .filter((c) => c.endpoints.length > 0);
  }, [api, query]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-3">
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
        {categories.map((category) => (
          <div key={category.id} className="mb-3 last:mb-0">
            <p className="mb-1 px-2 text-xs font-semibold text-ink-muted">{category.title}</p>
            <ul className="space-y-0.5">
              {category.endpoints.map((endpoint) => {
                const active = endpoint.id === selected.id;
                return (
                  <li key={endpoint.id}>
                    <button
                      type="button"
                      aria-current={active ? "true" : undefined}
                      onClick={() => onSelect(endpoint)}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-start text-sm text-ink-muted transition-colors duration-150 hover:bg-surface-2 hover:text-ink aria-[current]:bg-accent-tint aria-[current]:font-semibold aria-[current]:text-accent"
                    >
                      <MethodBadge method={endpoint.method} size="sm" />
                      <span className="min-w-0 flex-1 truncate">{endpoint.title}</span>
                      {endpoint.status !== "stable" && <LifecycleBadge status={endpoint.status} compact />}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
}
