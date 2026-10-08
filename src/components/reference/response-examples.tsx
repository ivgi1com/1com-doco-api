"use client";

import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { CopyButton } from "@/components/code/copy-button";
import type { Evidence } from "@/content/types";

export interface RenderedResponse {
  status: number;
  code: string | null;
  html: string | null;
  evidence?: Evidence;
  /** The body is binary (e.g. audio); never rendered as text. */
  binary?: boolean;
  /** Fields are documented but the source gives no example body. */
  schemaOnly?: boolean;
}

function statusTone(status: number) {
  if (status < 300) return "bg-[#a8dc8c]";
  if (status < 500) return "bg-[#f0c674]";
  return "bg-[#f29a8a]";
}

/** Response example with a status selector; always dark and LTR. */
export function ResponseExamples({ responses }: { responses: RenderedResponse[] }) {
  const t = useTranslations("endpoint");
  const [status, setStatus] = useState(responses[0]?.status);
  const selectId = useId();
  const current = responses.find((r) => r.status === status) ?? responses[0];
  if (!current) return null;

  return (
    <div dir="ltr" className="overflow-hidden rounded-md border border-code-border bg-code-bg text-code-ink">
      <div className="flex h-10 items-center justify-between gap-2 border-b border-code-border ps-3 pe-1">
        <label htmlFor={selectId} className="text-xs font-semibold text-code-muted">
          {t("responseExample")}
        </label>
        <div className="flex items-center gap-2">
          {current.evidence === "observed-sanitized" && (
            <span className="whitespace-nowrap rounded-sm bg-code-surface px-1.5 py-0.5 text-[11px] font-semibold text-code-muted">
              {t("evidenceObservedSanitizedShort")}
            </span>
          )}
          {current.evidence === "vendor" && (
            <span className="whitespace-nowrap rounded-sm bg-code-surface px-1.5 py-0.5 text-[11px] font-semibold text-code-muted">
              {t("evidenceVendor")}
            </span>
          )}
          <span className="relative inline-flex items-center">
            <span aria-hidden className={`pointer-events-none absolute start-2 size-1.5 rounded-full ${statusTone(current.status)}`} />
            <select
              id={selectId}
              value={current.status}
              onChange={(e) => setStatus(Number(e.target.value))}
              className="h-7 appearance-none rounded-md border border-code-border bg-code-surface ps-5 pe-2 font-mono text-xs text-code-ink"
            >
              {responses.map((r) => (
                <option key={r.status} value={r.status}>
                  {r.status}
                </option>
              ))}
            </select>
          </span>
          {current.code && <CopyButton text={current.code} />}
        </div>
      </div>
      {current.html ? (
        <div tabIndex={0} className="code-body max-h-[28rem] overflow-y-auto" dangerouslySetInnerHTML={{ __html: current.html }} />
      ) : (
        <p className="px-4 py-3 font-mono text-sm text-code-muted">{current.binary ? t("binaryBody") : current.schemaOnly ? t("noExampleSchemaOnly") : t("noBody")}</p>
      )}
      {current.evidence === "observed-sanitized" && (
        <p className="border-t border-code-border px-3 py-1.5 text-[11px] text-code-muted">{t("evidenceObservedSanitized")}</p>
      )}
    </div>
  );
}
