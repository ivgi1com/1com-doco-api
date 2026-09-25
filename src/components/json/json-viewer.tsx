"use client";

import { Copy, Download, ListTree, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId, useMemo, useState } from "react";
import { copyText } from "@/components/code/copy-button";
import { formatJsonPath, type PathSegment } from "@/lib/json-path";
import { JsonNode } from "./json-node";

function downloadJson(text: string, filename: string) {
  try {
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    // Best-effort; no fallback needed (Copy JSON remains available).
  }
}

function isContainer(value: unknown): value is Record<string, unknown> | unknown[] {
  return typeof value === "object" && value !== null;
}

function entriesOf(value: Record<string, unknown> | unknown[]): [string | number, unknown][] {
  return Array.isArray(value) ? value.map((v, i) => [i, v] as [number, unknown]) : Object.entries(value);
}

function collectContainerPaths(value: unknown, path: PathSegment[], out: Set<string>) {
  if (!isContainer(value)) return;
  const entries = entriesOf(value);
  if (entries.length > 0) out.add(formatJsonPath(path));
  for (const [k, v] of entries) collectContainerPaths(v, [...path, k], out);
}

/** Marks nodes whose key or value contains `query`, and their ancestor containers (to force them open). */
function collectSearchMatches(
  value: unknown,
  path: PathSegment[],
  keyName: string | number | undefined,
  query: string,
  matched: Set<string>,
  forceOpen: Set<string>,
): boolean {
  const pathKey = formatJsonPath(path);
  const keyMatch = keyName !== undefined && String(keyName).toLowerCase().includes(query);

  if (isContainer(value)) {
    let childMatch = false;
    for (const [k, v] of entriesOf(value)) {
      if (collectSearchMatches(v, [...path, k], k, query, matched, forceOpen)) childMatch = true;
    }
    if (childMatch) forceOpen.add(pathKey);
    if (keyMatch) matched.add(pathKey);
    return keyMatch || childMatch;
  }

  const valueMatch = value !== null && value !== undefined && String(value).toLowerCase().includes(query);
  const isMatch = keyMatch || valueMatch;
  if (isMatch) matched.add(pathKey);
  return isMatch;
}

export function JsonViewer({
  data,
  className = "",
  maxHeight = "28rem",
  filename = "response.json",
}: {
  data: unknown;
  className?: string;
  maxHeight?: string;
  filename?: string;
}) {
  const t = useTranslations("json");
  const searchId = useId();
  const [collapsedPaths, setCollapsedPaths] = useState<Set<string>>(new Set());
  const [view, setView] = useState<"tree" | "raw">("tree");
  const [query, setQuery] = useState("");

  const allContainerPaths = useMemo(() => {
    const out = new Set<string>();
    collectContainerPaths(data, [], out);
    return out;
  }, [data]);

  const search = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { matched: new Set<string>(), forceOpen: new Set<string>(), active: false };
    const matched = new Set<string>();
    const forceOpen = new Set<string>();
    collectSearchMatches(data, [], undefined, q, matched, forceOpen);
    return { matched, forceOpen, active: true };
  }, [data, query]);

  const toggle = (pathKey: string) => {
    setCollapsedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(pathKey)) next.delete(pathKey);
      else next.add(pathKey);
      return next;
    });
  };

  const raw = useMemo(() => JSON.stringify(data, null, 2), [data]);

  return (
    // Flex column, not CSS `position: sticky`: the toolbar below is a plain,
    // non-growing flex header and the content div is the one scrolling
    // region. This makes overlap structurally impossible — sticky's
    // "stuck" geometry depends on a shared scrolling ancestor's state
    // (fragile when that ancestor also holds other content, e.g. the
    // redaction callouts above this component), which is what previously
    // let real JSON rows render behind the toolbar.
    <div
      dir="ltr"
      className={`flex flex-col overflow-hidden rounded-md border border-code-border bg-code-bg text-code-ink ${className}`}
      style={{ maxHeight }}
    >
      <div
        data-testid="json-toolbar"
        className="flex shrink-0 flex-wrap items-center gap-2 border-b border-code-border px-2 py-1.5"
      >
        <div role="group" aria-label={t("tree")} className="flex items-center overflow-hidden rounded-md border border-code-border">
          <button
            type="button"
            aria-pressed={view === "tree"}
            onClick={() => setView("tree")}
            className="flex h-7 items-center gap-1 px-2 text-xs font-semibold text-code-muted transition-colors duration-150 aria-pressed:bg-code-surface aria-pressed:text-code-ink"
          >
            <ListTree className="size-3.5" aria-hidden />
            {t("tree")}
          </button>
          <button
            type="button"
            aria-pressed={view === "raw"}
            onClick={() => setView("raw")}
            className="h-7 border-s border-code-border px-2 text-xs font-semibold text-code-muted transition-colors duration-150 aria-pressed:bg-code-surface aria-pressed:text-code-ink"
          >
            {t("raw")}
          </button>
        </div>

        {view === "tree" && (
          <>
            <button
              type="button"
              onClick={() => setCollapsedPaths(new Set())}
              className="h-7 shrink-0 rounded-md px-2 text-xs font-semibold text-code-muted hover:bg-code-surface hover:text-code-ink"
            >
              {t("expandAll")}
            </button>
            <button
              type="button"
              onClick={() => setCollapsedPaths(new Set(allContainerPaths))}
              className="h-7 shrink-0 rounded-md px-2 text-xs font-semibold text-code-muted hover:bg-code-surface hover:text-code-ink"
            >
              {t("collapseAll")}
            </button>
            <label htmlFor={searchId} className="sr-only">
              {t("search")}
            </label>
            <span className="relative flex min-w-[9rem] flex-1 items-center">
              <Search className="pointer-events-none absolute start-2 size-3.5 text-code-muted" aria-hidden />
              <input
                id={searchId}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("search")}
                className="h-7 w-full rounded-md border border-code-border bg-code-surface ps-7 pe-2 text-xs text-code-ink placeholder:text-code-muted"
              />
            </span>
          </>
        )}
        <button
          type="button"
          onClick={() => void copyText(raw)}
          className="ms-auto flex h-7 shrink-0 items-center gap-1.5 rounded-md px-2 text-xs font-semibold text-code-muted hover:bg-code-surface hover:text-code-ink"
        >
          <Copy className="size-3.5" aria-hidden />
          {t("copy")}
        </button>
        <button
          type="button"
          onClick={() => downloadJson(raw, filename)}
          className="flex h-7 shrink-0 items-center gap-1.5 rounded-md px-2 text-xs font-semibold text-code-muted hover:bg-code-surface hover:text-code-ink"
        >
          <Download className="size-3.5" aria-hidden />
          {t("download")}
        </button>
      </div>

      <div data-testid="json-content" className="min-h-0 flex-1 overflow-y-auto p-1.5">
        {view === "tree" ? (
          <>
            {search.active && search.matched.size === 0 && (
              <p className="px-2 py-1 text-xs text-code-muted">{t("noMatches")}</p>
            )}
            <JsonNode
              value={data}
              path={[]}
              depth={0}
              collapsedPaths={collapsedPaths}
              onToggle={toggle}
              forceOpenPaths={search.forceOpen}
              matchedPaths={search.matched}
              searchActive={search.active}
            />
          </>
        ) : (
          <pre className="whitespace-pre-wrap break-all px-1.5 py-1 font-mono text-[13px] leading-[1.5] text-code-ink">{raw}</pre>
        )}
      </div>
    </div>
  );
}
