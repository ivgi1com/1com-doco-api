"use client";

import { ChevronRight } from "lucide-react";
import { type ReactNode, useEffect, useId, useState } from "react";

/**
 * Nested-attribute disclosure. Opens automatically when the URL hash targets
 * a field inside it, so child fields stay deep-linkable.
 */
export function ChildDisclosure({
  anchor,
  showLabel,
  hideLabel,
  count,
  children,
}: {
  anchor: string;
  showLabel: string;
  hideLabel: string;
  count: number;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  useEffect(() => {
    const sync = () => {
      const hash = decodeURIComponent(window.location.hash.slice(1));
      if (hash.startsWith(`${anchor}.`)) {
        setOpen(true);
        requestAnimationFrame(() => document.getElementById(hash)?.scrollIntoView());
      }
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [anchor]);

  return (
    <div className="pt-1">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-7 items-center gap-1 rounded-md border border-border px-2 text-xs font-semibold text-ink-muted transition-colors duration-150 hover:border-border-control hover:text-ink"
      >
        <ChevronRight
          className={`icon-directional size-3.5 transition-transform duration-150 ease-out-quart ${open ? "rotate-90 rtl:-rotate-90" : ""}`}
          aria-hidden
        />
        {open ? hideLabel : showLabel}
        <span className="font-normal">({count})</span>
      </button>
      <div
        id={panelId}
        hidden={!open}
        className="mt-2 rounded-md border border-border px-3"
      >
        {children}
      </div>
    </div>
  );
}
