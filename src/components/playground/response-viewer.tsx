"use client";

import { Inbox } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { CopyButton } from "@/components/code/copy-button";
import { Callout } from "@/components/ui/callout";
import { JsonViewer } from "@/components/json/json-viewer";
import type { Endpoint } from "@/content/types";
import { authEnvVar } from "@/lib/code-samples";
import { formatBytes } from "@/lib/json-path";
import { curlEquivalent, type PlaygroundResponse } from "./executor";
import type { PlaygroundState } from "./use-playground";

function statusTone(status: number) {
  if (status < 300) return "text-success-ink";
  if (status < 500) return "text-warning-ink";
  return "text-danger-ink";
}

/** Portal-side failures shown as distinct callouts — never answered with Demo data. */
const PORTAL_ERROR_TONE: Record<string, "warning" | "danger"> = {
  live_disabled: "warning",
  forbidden_origin: "warning",
  unsupported_media_type: "danger",
  payload_too_large: "warning",
  rate_limited: "warning",
  invalid_request: "warning",
  endpoint_not_allowed: "warning",
  missing_credential: "warning",
  upstream_timeout: "danger",
  upstream_too_large: "danger",
  upstream_redirect: "danger",
  upstream_unreachable: "danger",
  portal_unreachable: "danger",
  invalid_portal_response: "danger",
};

function PortalErrorCallout({
  response,
}: {
  response: Extract<PlaygroundResponse, { source: "LIVE"; kind: "portal-error" }>;
}) {
  const t = useTranslations("playground");
  const tone = PORTAL_ERROR_TONE[response.code] ?? "danger";
  return (
    <div className="space-y-3 p-4">
      <Callout kind={tone} title={t("errorTitle")}>
        <p>
          {t(`portalError.${response.code}`, {
            seconds: response.retryAfterSeconds ?? 60,
          })}
        </p>
      </Callout>
      <div dir="ltr" className="rounded-md border border-code-border bg-code-bg p-2 font-mono text-xs text-code-muted">
        {response.request.method} {response.request.url}
      </div>
    </div>
  );
}

function RequestTab({ response, endpoint }: { response: Extract<PlaygroundResponse, { source: "LIVE"; kind: "response" }>; endpoint: Endpoint }) {
  const t = useTranslations("code");
  const envVar = authEnvVar(endpoint);
  const curl = curlEquivalent(response.request, envVar);
  return (
    <div dir="ltr" className="space-y-3">
      <div>
        <p className="mb-1 font-mono text-[11px] uppercase tracking-wide text-ink-muted">{response.request.method}</p>
        <div className="flex items-start gap-2 rounded-md border border-code-border bg-code-bg p-2 font-mono text-xs text-code-ink">
          <span className="min-w-0 flex-1 break-all">{response.request.url}</span>
          <CopyButton text={response.request.url} label={t("copy")} tone="code" />
        </div>
      </div>
      <div>
        {/* "cURL" is a proper noun, not translated — matches the existing
            untranslated label in src/lib/code-samples.ts. */}
        <p className="mb-1 font-mono text-[11px] uppercase tracking-wide text-ink-muted">cURL</p>
        <div className="flex items-start gap-2 rounded-md border border-code-border bg-code-bg p-2 font-mono text-xs text-code-ink">
          <span className="min-w-0 flex-1 break-all">{curl}</span>
          <CopyButton text={curl} label={t("copy")} tone="code" />
        </div>
      </div>
    </div>
  );
}

export function ResponseViewer({ state, endpoint }: { state: PlaygroundState; endpoint: Endpoint }) {
  const t = useTranslations("playground");
  const [tab, setTab] = useState<"body" | "headers" | "request">("body");
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

  if (response.source === "LIVE" && response.kind === "portal-error") {
    return <PortalErrorCallout response={response} />;
  }

  if (response.source === "DEMO" && response.unavailable) {
    return (
      <div className="p-4">
        <Callout kind="note" title={t("demoUnavailableTitle")}>
          <p>{t("demoUnavailableBody")}</p>
        </Callout>
      </div>
    );
  }

  const isLive = response.source === "LIVE";
  const { status, latencyMs, sizeBytes } = response;

  const headerEntries: [string, string][] = isLive
    ? [["x-response-source", response.source], ...Object.entries(response.headers)]
    : [
        ["x-request-id", response.requestId],
        ["x-response-source", response.source],
        ...(response.body !== null ? ([["content-type", "application/json"]] as [string, string][]) : []),
      ];

  const tabs: ("body" | "headers" | "request")[] = isLive ? ["body", "headers", "request"] : ["body", "headers"];
  // A tab selected for a previous response (e.g. "request") may not apply to
  // this one; fall back to "body" for this render without touching state.
  const activeTab = tabs.includes(tab) ? tab : "body";

  return (
    <div className="flex h-full flex-col">
      <div dir="ltr" className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-border px-4 py-2 font-mono text-xs">
        <span
          className={`rounded-sm px-1.5 py-0.5 font-semibold ${
            isLive ? "bg-live-tint text-live-ink" : "bg-demo-tint text-demo-ink"
          }`}
        >
          {t("source")}: {response.source}
        </span>
        <span className={`font-semibold tabular ${statusTone(status)}`}>
          {t("status")}: {status}
        </span>
        <span className="tabular text-ink-muted">
          {t("latency")}: {latencyMs}ms
        </span>
        <span className="tabular text-ink-muted">
          {t("size")}: {formatBytes(sizeBytes)}
        </span>
        {!isLive && (
          <span className="min-w-0 truncate text-ink-muted">
            {t("requestId")}: {response.requestId}
          </span>
        )}
      </div>

      <div role="tablist" className="flex items-center gap-1 border-b border-border px-3 py-1.5">
        {tabs.map((id) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={activeTab === id}
            onClick={() => setTab(id)}
            className="rounded-md px-2.5 py-1 text-xs font-semibold text-ink-muted transition-colors duration-150 aria-selected:bg-accent-tint aria-selected:text-accent"
          >
            {t(id)}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3" aria-live="polite">
        {isLive && response.fieldsOmitted > 0 && (
          <Callout kind="note" className="mb-3">
            <p>{t("fieldsOmitted", { count: response.fieldsOmitted })}</p>
          </Callout>
        )}
        {isLive && response.redactedCount !== 0 && (
          <Callout kind="note" className="mb-3">
            <p>
              {response.redactedCount < 0
                ? t("redactedWithheld")
                : t("redactedCount", { count: response.redactedCount })}
            </p>
          </Callout>
        )}
        {activeTab === "body" && isLive && response.format === "text" && String(response.body).trim() === "" && (
          <Callout kind="note" className="mb-3">
            <p>{t("upstreamEmpty")}</p>
          </Callout>
        )}
        {activeTab === "body" &&
          (isLive && response.format === "text" ? (
            <pre dir="ltr" className="whitespace-pre-wrap break-all rounded-md border border-code-border bg-code-bg p-3 font-mono text-xs text-code-ink">
              {String(response.body)}
            </pre>
          ) : (
            // h-full + maxHeight="none": JsonViewer fills this tab panel's
            // own height (via its `flex h-full flex-col` ancestor chain)
            // and owns its scrolling internally, rather than sharing this
            // panel's scroll with the callouts above it.
            <JsonViewer data={response.body} maxHeight="none" className="h-full" filename={`${endpoint.id}-response.json`} />
          ))}
        {activeTab === "headers" && (
          <dl dir="ltr" className="space-y-1 rounded-md border border-code-border bg-code-bg p-3 font-mono text-xs text-code-ink">
            {headerEntries.map(([key, value]) => (
              <div key={key} className="flex gap-2">
                <dt className="text-code-muted">{key}:</dt>
                <dd className="min-w-0 flex-1 truncate">{value}</dd>
              </div>
            ))}
          </dl>
        )}
        {activeTab === "request" && isLive && response.kind === "response" && (
          <RequestTab response={response} endpoint={endpoint} />
        )}
      </div>
    </div>
  );
}
