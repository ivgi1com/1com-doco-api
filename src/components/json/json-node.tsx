"use client";

import { ChevronRight, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { copyText } from "@/components/code/copy-button";
import { formatJsonPath, type PathSegment } from "@/lib/json-path";
import { syntax } from "@/lib/syntax-colors";

const PAGE_SIZE = 50;
const STRING_TRUNCATE_AT = 140;

type Entry = [key: string | number, value: unknown];

function isContainer(value: unknown): value is Record<string, unknown> | unknown[] {
  return typeof value === "object" && value !== null;
}

function entriesOf(value: Record<string, unknown> | unknown[]): Entry[] {
  return Array.isArray(value) ? value.map((v, i) => [i, v] as Entry) : Object.entries(value);
}

function NodeAction({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="grid size-6 shrink-0 place-items-center rounded-sm text-code-muted opacity-0 transition-opacity duration-150 hover:bg-code-surface hover:text-code-ink focus-visible:opacity-100 group-hover/row:opacity-100"
    >
      <Copy className="size-3.5" aria-hidden />
    </button>
  );
}

export function JsonNode({
  keyName,
  value,
  path,
  depth,
  collapsedPaths,
  onToggle,
  forceOpenPaths,
  matchedPaths,
  searchActive,
}: {
  keyName?: string | number;
  value: unknown;
  path: PathSegment[];
  depth: number;
  collapsedPaths: Set<string>;
  onToggle: (pathKey: string) => void;
  forceOpenPaths: Set<string>;
  matchedPaths: Set<string>;
  searchActive: boolean;
}) {
  const t = useTranslations("json");
  const [shown, setShown] = useState(PAGE_SIZE);
  const [stringExpanded, setStringExpanded] = useState(false);
  const pathKey = formatJsonPath(path);
  const matched = matchedPaths.has(pathKey);
  const dimmed = searchActive && matchedPaths.size > 0 && !matched;

  const keyLabel =
    keyName === undefined ? null : (
      <>
        <span style={{ color: syntax.key }} className="font-semibold">
          {typeof keyName === "number" ? keyName : JSON.stringify(keyName)}
        </span>
        <span style={{ color: syntax.punct }}>:</span>{" "}
      </>
    );

  if (isContainer(value)) {
    const entries = entriesOf(value);
    const isArray = Array.isArray(value);
    const open = forceOpenPaths.has(pathKey) || !collapsedPaths.has(pathKey);
    const empty = entries.length === 0;
    const visible = entries.slice(0, shown);
    const hasMore = entries.length > visible.length;
    const openBracket = isArray ? "[" : "{";
    const closeBracket = isArray ? "]" : "}";
    const countLabel = isArray ? t("items", { count: entries.length }) : t("keys", { count: entries.length });

    return (
      <div className={dimmed ? "opacity-40" : ""}>
        <div className="group/row flex items-start gap-0.5 rounded-sm px-1 hover:bg-code-surface/60">
          {!empty ? (
            <button
              type="button"
              aria-expanded={open}
              aria-label={open ? t("collapseAll") : t("expandAll")}
              onClick={() => onToggle(pathKey)}
              className="mt-[3px] grid size-4 shrink-0 place-items-center text-code-muted"
            >
              <ChevronRight
                className={`icon-directional size-3 transition-transform duration-150 ease-out-quart ${open ? "rotate-90" : ""}`}
                aria-hidden
              />
            </button>
          ) : (
            <span className="mt-[3px] size-4 shrink-0" aria-hidden />
          )}
          <div className="min-w-0 flex-1 py-0.5 font-mono text-[13px] leading-[1.5]">
            {keyLabel}
            <span style={{ color: syntax.punct }}>{openBracket}</span>
            {!open && !empty && (
              <>
                <span className="mx-1 text-code-muted">{countLabel}</span>
                <span style={{ color: syntax.punct }}>{closeBracket}</span>
              </>
            )}
            {empty && <span style={{ color: syntax.punct }}>{closeBracket}</span>}
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            <NodeAction label={t("copyValue")} onClick={() => void copyText(JSON.stringify(value, null, 2))} />
            <NodeAction label={t("copyPath")} onClick={() => void copyText(pathKey)} />
          </div>
        </div>
        {open && !empty && (
          <div className="ms-4 border-s border-code-border ps-2">
            {visible.map(([k, v]) => (
              <JsonNode
                key={k}
                keyName={k}
                value={v}
                path={[...path, k]}
                depth={depth + 1}
                collapsedPaths={collapsedPaths}
                onToggle={onToggle}
                forceOpenPaths={forceOpenPaths}
                matchedPaths={matchedPaths}
                searchActive={searchActive}
              />
            ))}
            {hasMore && (
              <button
                type="button"
                onClick={() => setShown((n) => n + PAGE_SIZE)}
                className="rounded-sm px-1 py-0.5 font-mono text-[13px] text-accent hover:underline"
              >
                {t("showMore", { count: entries.length - visible.length })}
              </button>
            )}
            <div className="px-1 py-0.5 font-mono text-[13px]" style={{ color: syntax.punct }}>
              {closeBracket}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Primitive: string, number, boolean, null.
  let display: string;
  let color: string;
  if (value === null) {
    display = "null";
    color = syntax.constant;
  } else if (typeof value === "boolean") {
    display = String(value);
    color = syntax.constant;
  } else if (typeof value === "number") {
    display = String(value);
    color = syntax.number;
  } else {
    const str = String(value);
    const truncated = !stringExpanded && str.length > STRING_TRUNCATE_AT;
    display = JSON.stringify(truncated ? `${str.slice(0, STRING_TRUNCATE_AT)}…` : str);
    color = syntax.string;
  }
  const isLongString = typeof value === "string" && value.length > STRING_TRUNCATE_AT;

  return (
    <div className={`group/row flex items-start gap-0.5 rounded-sm px-1 hover:bg-code-surface/60 ${dimmed ? "opacity-40" : ""}`}>
      <span className="mt-[3px] size-4 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1 py-0.5 font-mono text-[13px] leading-[1.5] break-all">
        {keyLabel}
        <span style={{ color }}>{display}</span>
        {isLongString && (
          <button
            type="button"
            onClick={() => setStringExpanded((v) => !v)}
            className="ms-2 text-xs text-accent hover:underline"
          >
            {t("expandString")}
          </button>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-0.5">
        <NodeAction label={t("copyValue")} onClick={() => void copyText(typeof value === "string" ? value : JSON.stringify(value))} />
        <NodeAction label={t("copyPath")} onClick={() => void copyText(pathKey)} />
      </div>
    </div>
  );
}
