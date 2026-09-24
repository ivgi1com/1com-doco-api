"use client";

import { Inbox } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Callout } from "@/components/ui/callout";
import { JsonViewer } from "@/components/json/json-viewer";
import { formatBytes } from "@/lib/json-path";
import type { PlaygroundState } from "./use-playground";

function statusTone(status: number) {
  if (status < 300) return "text-success-ink";
  if (status < 500) return "text-warning-ink";
  return "text-danger-ink";
}

export function ResponseViewer({ state }: { state: PlaygroundState }) {
  const t = useTranslations("playground");
  const [tab, setTab] = useState<"body" | "headers">("body");
  const { response, sending, elapsedMs } = state;

  if (sending) {
    return (
      <div className="flex h-full min-h-[16rem] flex-col items-center justify-center gap-3 text-ink-muted">
        <span aria-hidden className="signal-dot size-2.5 rounded-full bg-accent" />
        <p dir="ltr" className="font-mono text-sm tabular">
          {Math.round(elapsedMs)} ms
        </p>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex h-full min-h-[16rem] flex-col items-center justify-center gap-2 px-6 text-center">
        <Inbox className="size-6 text-ink-muted" aria-hidden />
        <p className="text-sm font-semibold text-ink">{t("emptyTitle")}</p>
        <p className="max-w-[28rem] text-sm text-ink-muted">{t("emptyBody")}</p>
      </div>
    );
  }

  if (response.source === "LIVE") {
    return (
      <div className="p-4">
        <Callout kind="danger" title={t("errorTitle")}>
          <p>{t("liveUnavailable")}</p>
        </Callout>
      </div>
    );
  }

  const headerEntries: [string, string][] = [
    ["x-request-id", response.requestId],
    ["x-response-source", response.source],
    ...(response.body !== null ? ([["content-type", "application/json"]] as [string, string][]) : []),
  ];

  return (
    <div className="flex h-full flex-col">
      <div dir="ltr" className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-border px-4 py-2 font-mono text-xs">
        <span className="rounded-sm bg-demo-tint px-1.5 py-0.5 font-semibold text-demo-ink">{t("source")}: {response.source}</span>
        <span className={`font-semibold tabular ${statusTone(response.status)}`}>
          {t("status")}: {response.status}
        </span>
        <span className="tabular text-ink-muted">
          {t("latency")}: {response.latencyMs}ms
        </span>
        <span className="tabular text-ink-muted">
          {t("size")}: {formatBytes(response.sizeBytes)}
        </span>
        <span className="min-w-0 truncate text-ink-muted">
          {t("requestId")}: {response.requestId}
        </span>
      </div>

      <div role="tablist" className="flex items-center gap-1 border-b border-border px-3 py-1.5">
        {(["body", "headers"] as const).map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className="rounded-md px-2.5 py-1 text-xs font-semibold text-ink-muted transition-colors duration-150 aria-selected:bg-accent-tint aria-selected:text-accent"
          >
            {t(id)}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3" aria-live="polite">
        {tab === "body" ? (
          <JsonViewer data={response.body} maxHeight="24rem" />
        ) : (
          <dl dir="ltr" className="space-y-1 rounded-md border border-code-border bg-code-bg p-3 font-mono text-xs text-code-ink">
            {headerEntries.map(([key, value]) => (
              <div key={key} className="flex gap-2">
                <dt className="text-code-muted">{key}:</dt>
                <dd className="min-w-0 flex-1 truncate">{value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}
