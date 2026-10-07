"use client";

import { useTranslations } from "next-intl";
import { useId } from "react";
import { InlineMarkup } from "@/components/reference/inline-markup";
import type { Parameter } from "@/content/types";
import { composeDateValue, defaultTimeFor, parseDateValue } from "@/lib/date-value";

/** One request-builder field: label always visible, LTR value, documented details below, error last (MASTER.md "Form controls"). */
export function ParamField({
  param,
  value,
  onChange,
  error,
}: {
  param: Parameter;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const te = useTranslations("endpoint");
  const id = useId();
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;
  const controlClass =
    "w-full rounded-md border bg-bg px-2.5 text-sm text-ink placeholder:text-ink-muted" +
    (error ? " border-danger-ink/60" : " border-border-control");
  // The documented default is shown as a placeholder only: pre-filling it
  // would send a value the user never chose and change which Demo scenario
  // resolves.
  const placeholder =
    param.example !== undefined ? String(param.example) : param.default !== undefined ? param.default : undefined;
  // Date/time controls sit side by side, so they must not inherit the full-width class.
  const inlineControlClass = controlClass.replace("w-full ", "");
  const describedBy = [helpId, error ? errorId : null].filter(Boolean).join(" ");
  const jsonField = param.type === "array" || param.type === "object";
  const tp = useTranslations("playground");
  // A picker only when the field documents an exact format AND the current
  // value is in it (or empty); anything else stays an editable text box so a
  // typed value is never rewritten.
  const dateParts = param.format ? parseDateValue(value, param.format) : null;
  const timeId = `${id}-time`;

  return (
    <div>
      <div className="mb-1 flex flex-wrap items-baseline gap-x-2">
        {/* The type sits outside the label so the control's accessible name stays the bare field name. */}
        <label htmlFor={id} className="flex items-baseline gap-x-2 text-xs font-semibold text-ink">
          <span dir="ltr">{param.name}</span>
          {param.required === true && <span className="font-normal text-danger-ink">*</span>}
        </label>
        <span dir="ltr" className="rounded-sm bg-surface-2 px-1 font-mono text-[11px] text-ink-muted">
          {param.type}
        </span>
      </div>
      {param.enum ? (
        <select
          id={id}
          dir="ltr"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={`${controlClass} h-8`}
        >
          {/* A required enum has to be chosen; an optional one can be cleared again. */}
          <option value="" disabled={param.required === true}>
            {param.required === true ? param.name : "—"}
          </option>
          {param.enum.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : param.format && dateParts ? (
        <div className="flex flex-wrap items-center gap-2" data-testid={`date-field-${param.name}`}>
          <input
            id={id}
            type="date"
            dir="ltr"
            value={dateParts.date}
            onChange={(e) =>
              onChange(composeDateValue({ ...dateParts, date: e.target.value }, param.format!, defaultTimeFor(param.name)))
            }
            aria-invalid={!!error}
            aria-describedby={describedBy}
            className={`${inlineControlClass} h-8 min-w-[9.5rem] flex-1`}
          />
          {param.format === "datetime" && (
            <>
              <label htmlFor={timeId} className="sr-only">
                {tp("timeOf", { name: param.name })}
              </label>
              <input
                id={timeId}
                type="time"
                step={1}
                dir="ltr"
                value={dateParts.time}
                disabled={!dateParts.date}
                onChange={(e) => {
                  // A time input yields HH:MM when the seconds are 00; the API wants HH:MM:SS.
                  const t = e.target.value.length === 5 ? `${e.target.value}:00` : e.target.value;
                  onChange(composeDateValue({ ...dateParts, time: t }, param.format!, defaultTimeFor(param.name)));
                }}
                className={`${inlineControlClass} h-8 min-w-[8rem] flex-1`}
              />
            </>
          )}
          <button
            type="button"
            onClick={() => onChange("")}
            disabled={!value}
            className="h-8 rounded-md border border-border-control px-2.5 text-xs font-medium text-ink-muted transition-colors duration-150 hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            {tp("clearDate")}
          </button>
        </div>
      ) : jsonField ? (
        <textarea
          id={id}
          dir="ltr"
          rows={2}
          spellCheck={false}
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={`${controlClass} py-1.5 font-mono text-xs`}
        />
      ) : (
        <input
          id={id}
          type={param.type === "integer" ? "number" : "text"}
          dir="ltr"
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={`${controlClass} h-8`}
        />
      )}
      {error && (
        <p id={errorId} className="mt-1 text-xs text-danger-ink">
          {error}
        </p>
      )}
      <div id={helpId} className="mt-1 space-y-0.5 text-xs text-ink-muted">
        {/* API content prose is English until the Hebrew scope is decided (same as the Reference's ContentText). */}
        {param.description && (
          <p lang="en" dir="auto">
            <InlineMarkup text={param.description} />
          </p>
        )}
        {param.condition && (
          <p lang="en" dir="auto">
            {param.condition}
          </p>
        )}
        {(param.default || param.constraints) && (
          <p className="flex flex-wrap gap-x-3">
            {param.default && (
              <span>
                {te("default")}: <code className="prose-code">{param.default}</code>
              </span>
            )}
            {param.constraints && (
              <span>
                {te("constraints")}: {param.constraints}
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
