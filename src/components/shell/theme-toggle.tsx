"use client";

import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useDismiss } from "@/components/ui/use-dismiss";
import {
  readThemePreference,
  resolveTheme,
  type ThemePreference,
  writeThemePreference,
} from "./theme";

const options: { value: ThemePreference; icon: typeof Sun }[] = [
  { value: "light", icon: Sun },
  { value: "dark", icon: Moon },
  { value: "system", icon: Monitor },
];

const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function ThemeToggle() {
  const t = useTranslations("theme");
  const pref = useSyncExternalStore(subscribe, readThemePreference, () => "system" as const);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);
  useDismiss(rootRef, open, close);

  // Follow OS changes while the preference is "system".
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (readThemePreference() === "system") {
        document.documentElement.dataset.theme = resolveTheme("system");
      }
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const select = (value: ThemePreference) => {
    writeThemePreference(value);
    listeners.forEach((l) => l());
    setOpen(false);
  };

  const Current = options.find((o) => o.value === pref)?.icon ?? Monitor;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${t("label")}: ${t(pref)}`}
        onClick={() => setOpen((v) => !v)}
        className="grid size-9 place-items-center rounded-md text-ink-muted transition-colors duration-150 hover:bg-surface-2 hover:text-ink"
      >
        <Current className="size-[18px]" aria-hidden />
      </button>
      {open && (
        <div
          role="menu"
          aria-label={t("label")}
          className="absolute end-0 top-full z-40 mt-2 w-40 rounded-lg border border-border bg-raised p-1 shadow-overlay"
        >
          {options.map(({ value, icon: Icon }) => (
            <button
              key={value}
              type="button"
              role="menuitemradio"
              aria-checked={pref === value}
              onClick={() => select(value)}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-start text-sm text-ink hover:bg-surface-2 aria-checked:font-semibold"
            >
              <Icon className="size-4 text-ink-muted" aria-hidden />
              <span className="flex-1">{t(value)}</span>
              {pref === value && <Check className="size-4 text-accent" aria-hidden />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
