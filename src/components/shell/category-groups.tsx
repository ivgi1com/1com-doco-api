"use client";

import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useState, type ReactNode } from "react";
import type { Endpoint, MenuGroup } from "@/content/types";

const bulkButtonClass =
  "rounded-md px-2 py-1 text-xs font-semibold text-ink-muted transition-colors duration-150 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:text-ink-muted";

function activeGroupId(groups: MenuGroup[], activeEndpointId: string | undefined) {
  return groups.find((g) => g.categories.some((c) => c.endpoints.some((e) => e.id === activeEndpointId)))?.id;
}

const endpointList = (endpoints: Endpoint[], renderEndpoint: (endpoint: Endpoint) => ReactNode, labelledBy?: string) => (
  <ul className="space-y-0.5" aria-labelledby={labelledBy}>
    {endpoints.map((endpoint) => (
      <li key={endpoint.id}>{renderEndpoint(endpoint)}</li>
    ))}
  </ul>
);

/**
 * Collapsible menu groups (content `menuGroups`) shared by the Reference
 * sidebar and the Playground endpoint picker, with Expand all / Collapse all.
 * Starts with only the active endpoint's group open; navigating to another
 * endpoint opens its group without closing the ones the user opened. A group
 * of several categories shows each one under a static sub-heading.
 * `forceOpen` (a live filter) shows every group and parks the bulk buttons.
 */
export function CategoryGroups({
  groups,
  activeEndpointId,
  forceOpen = false,
  renderEndpoint,
}: {
  groups: MenuGroup[];
  activeEndpointId: string | undefined;
  forceOpen?: boolean;
  renderEndpoint: (endpoint: Endpoint) => ReactNode;
}) {
  const t = useTranslations("nav");
  const idBase = useId();
  const activeId = activeGroupId(groups, activeEndpointId);
  const [open, setOpen] = useState<Set<string>>(() => new Set(activeId ? [activeId] : []));
  const [seenActiveId, setSeenActiveId] = useState(activeId);

  // Adjust state while rendering (not in an effect): a new active category opens once.
  if (activeId !== seenActiveId) {
    setSeenActiveId(activeId);
    if (activeId && !open.has(activeId)) setOpen(new Set(open).add(activeId));
  }

  const setGroup = (id: string, isOpen: boolean) =>
    setOpen((prev) => {
      if (prev.has(id) === isOpen) return prev;
      const next = new Set(prev);
      if (isOpen) next.add(id);
      else next.delete(id);
      return next;
    });

  return (
    <div>
      <div className="mb-1 flex items-center gap-1">
        <button
          type="button"
          disabled={forceOpen}
          onClick={() => setOpen(new Set(groups.map((g) => g.id)))}
          className={bulkButtonClass}
        >
          {t("expandAll")}
        </button>
        <button type="button" disabled={forceOpen} onClick={() => setOpen(new Set())} className={bulkButtonClass}>
          {t("collapseAll")}
        </button>
      </div>
      {groups.map((group) => (
        <details
          key={group.id}
          open={forceOpen || open.has(group.id)}
          onToggle={(e) => {
            if (!forceOpen) setGroup(group.id, e.currentTarget.open);
          }}
          className="group mb-3 last:mb-0"
        >
          <summary className="mb-1 flex cursor-pointer list-none items-center justify-between rounded-md px-2 py-1 text-xs font-semibold text-ink-muted hover:text-ink [&::-webkit-details-marker]:hidden">
            {group.title}
            <ChevronDown
              className="size-3.5 -rotate-90 transition-transform duration-150 ease-out-quart group-open:rotate-0"
              aria-hidden
            />
          </summary>
          {!group.subheadings
            ? endpointList(group.categories.flatMap((c) => c.endpoints), renderEndpoint)
            : group.categories.map((category) => {
                const labelId = `${idBase}-${category.id}`;
                return (
                  <div key={category.id} className="mb-2 last:mb-0">
                    <p id={labelId} className="px-2 pb-0.5 pt-1 text-[0.6875rem] font-medium uppercase tracking-wide text-ink-muted">
                      {category.title}
                    </p>
                    {endpointList(category.endpoints, renderEndpoint, labelId)}
                  </div>
                );
              })}
        </details>
      ))}
    </div>
  );
}
