"use client";

import { BookOpen, CornerDownLeft, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { MethodBadge } from "@/components/ui/method-badge";
import { type SearchItem, searchItems } from "@/lib/search-index";

function isTypingTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  return !!el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));
}

export function SearchPalette({ items }: { items: SearchItem[] }) {
  const t = useTranslations("search");
  const tn = useTranslations("nav");
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listId = useId();

  const results = useMemo(() => searchItems(items, query), [items, query]);
  const groups = (["endpoint", "guide"] as const)
    .map((kind) => ({ kind, items: results.filter((r) => r.kind === kind) }))
    .filter((g) => g.items.length);
  const flat = groups.flatMap((g) => g.items);

  const open = useCallback(() => {
    setQuery("");
    setActive(0);
    dialogRef.current?.showModal();
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        open();
      } else if (e.key === "/" && !isTypingTarget(e.target) && !dialogRef.current?.open) {
        e.preventDefault();
        open();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const go = (item: SearchItem | undefined) => {
    if (!item) return;
    dialogRef.current?.close();
    router.push(item.href);
  };

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(flat[active]);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={open}
        className="hidden h-9 w-56 items-center gap-2 rounded-md border border-border bg-surface-2 px-3 text-sm text-ink-muted transition-colors duration-150 hover:border-border-control hover:text-ink md:flex xl:w-64"
      >
        <Search className="size-4" aria-hidden />
        <span className="flex-1 text-start">{tn("search")}</span>
        <kbd dir="ltr" className="rounded-sm border border-border bg-bg px-1.5 font-mono text-[11px]">
          Ctrl K
        </kbd>
      </button>
      <button
        type="button"
        onClick={open}
        aria-label={tn("search")}
        className="grid size-10 place-items-center rounded-md text-ink-muted hover:bg-surface-2 hover:text-ink md:hidden"
      >
        <Search className="size-[18px]" aria-hidden />
      </button>

      <dialog
        ref={dialogRef}
        aria-label={tn("search")}
        onClick={(e) => e.target === dialogRef.current && dialogRef.current?.close()}
        className="mx-auto mt-[12vh] w-[min(40rem,calc(100vw-2rem))] rounded-lg border border-border bg-raised p-0 text-ink shadow-overlay backdrop:bg-black/40"
      >
        <div className="flex items-center gap-2 border-b border-border px-4">
          <Search className="size-4 shrink-0 text-ink-muted" aria-hidden />
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded="true"
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={flat[active] ? `${listId}-${active}` : undefined}
            aria-label={t("placeholder")}
            placeholder={t("placeholder")}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onInputKey}
            className="h-12 flex-1 bg-transparent text-base outline-none placeholder:text-ink-muted"
          />
          <kbd className="rounded-sm border border-border px-1.5 font-mono text-[11px] text-ink-muted">Esc</kbd>
        </div>
        <div id={listId} role="listbox" aria-label={t("placeholder")} className="max-h-[50vh] overflow-y-auto p-2">
          {flat.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-ink-muted">{t("empty", { query })}</p>
          )}
          {groups.map((group) => {
            const label = t(group.kind === "endpoint" ? "endpoints" : "guides");
            return (
              <div key={group.kind} role="group" aria-label={label}>
                <p className="px-3 pb-1 pt-2 text-xs font-semibold text-ink-muted">{label}</p>
                {group.items.map((item) => {
                  const index = flat.indexOf(item);
                  const selected = index === active;
                  return (
                    <div
                      key={item.href}
                      id={`${listId}-${index}`}
                      role="option"
                      aria-selected={selected}
                      onMouseMove={() => setActive(index)}
                      onClick={() => go(item)}
                      className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 aria-selected:bg-accent-tint"
                    >
                      {item.method ? (
                        <MethodBadge method={item.method} size="sm" />
                      ) : (
                        <BookOpen className="size-4 shrink-0 text-ink-muted" aria-hidden />
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{item.title}</span>
                        {item.kind === "endpoint" ? (
                          <span dir="ltr" className="block truncate text-start font-mono text-xs text-ink-muted">
                            {item.detail}
                          </span>
                        ) : (
                          <span className="block truncate text-xs text-ink-muted">{item.detail}</span>
                        )}
                      </span>
                      {selected && <CornerDownLeft className="size-4 shrink-0 text-ink-muted" aria-hidden />}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
        <p className="border-t border-border px-4 py-2 text-xs text-ink-muted">{t("hint")}</p>
      </dialog>
    </>
  );
}
