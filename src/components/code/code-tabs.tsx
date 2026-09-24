"use client";

import { useTranslations } from "next-intl";
import { type KeyboardEvent, type ReactNode, useCallback, useId, useRef, useSyncExternalStore } from "react";
import { CopyButton } from "./copy-button";

export interface RenderedSample {
  id: string;
  label: string;
  code: string;
  html: string;
  lines: number;
}

const STORAGE_KEY = "portal-code-lang";
const EVENT = "portal-code-lang";

function readLang(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

/** Language choice persists per viewer and applies site-wide (MASTER.md "Code blocks"). */
function useCodeLanguage(ids: string[]) {
  const stored = useSyncExternalStore(subscribe, readLang, () => null);
  const active = stored && ids.includes(stored) ? stored : ids[0];
  const setActive = useCallback((id: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // Not persisted; still switch for this page.
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return [active, setActive] as const;
}

export function CodeTabs({
  samples,
  toolbarEnd,
  className = "",
}: {
  samples: RenderedSample[];
  toolbarEnd?: ReactNode;
  className?: string;
}) {
  const t = useTranslations("code");
  const baseId = useId();
  const [active, setActive] = useCodeLanguage(samples.map((s) => s.id));
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = samples.find((s) => s.id === active) ?? samples[0];

  const onKeyDown = (e: KeyboardEvent, index: number) => {
    const dir = document.documentElement.dir === "rtl" ? -1 : 1;
    let next = index;
    if (e.key === "ArrowRight") next = index + dir;
    else if (e.key === "ArrowLeft") next = index - dir;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = samples.length - 1;
    else return;
    e.preventDefault();
    next = (next + samples.length) % samples.length;
    setActive(samples[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    <div dir="ltr" className={`overflow-hidden rounded-md border border-code-border bg-code-bg text-code-ink ${className}`}>
      <div className="flex items-center justify-between gap-2 border-b border-code-border ps-1 pe-1">
        <div role="tablist" aria-label={t("languages")} className="flex min-w-0 overflow-x-auto">
          {samples.map((sample, i) => {
            const selected = sample.id === current.id;
            return (
              <button
                key={sample.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                id={`${baseId}-tab-${sample.id}`}
                role="tab"
                type="button"
                aria-selected={selected}
                aria-controls={`${baseId}-panel`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(sample.id)}
                onKeyDown={(e) => onKeyDown(e, i)}
                className="relative h-10 shrink-0 px-3 text-xs font-semibold text-code-muted transition-colors duration-150 hover:text-code-ink aria-selected:text-code-ink after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-transparent after:transition-colors after:duration-150 aria-selected:after:bg-[#a1bdf9]"
              >
                {sample.label}
              </button>
            );
          })}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {toolbarEnd}
          <CopyButton text={current.code} />
        </div>
      </div>
      <div
        id={`${baseId}-panel`}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${current.id}`}
        tabIndex={0}
        className={`code-body ${current.lines > 10 ? "with-lines" : ""}`}
        dangerouslySetInnerHTML={{ __html: current.html }}
      />
    </div>
  );
}
