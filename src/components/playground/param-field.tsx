"use client";

import { useId } from "react";
import type { Parameter } from "@/content/types";

/** One request-builder field: label always visible, LTR value, error below (MASTER.md "Form controls"). */
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
  const id = useId();
  const errorId = `${id}-error`;
  const controlClass =
    "h-8 w-full rounded-md border bg-bg px-2.5 text-sm text-ink placeholder:text-ink-muted" +
    (error ? " border-danger-ink/60" : " border-border-control");

  return (
    <div>
      <label htmlFor={id} className="mb-1 flex flex-wrap items-baseline gap-x-2 text-xs font-semibold text-ink">
        <span dir="ltr">{param.name}</span>
        {param.required && <span className="font-normal text-danger-ink">*</span>}
      </label>
      {param.enum ? (
        <select
          id={id}
          dir="ltr"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={controlClass}
        >
          <option value="" disabled>
            {param.name}
          </option>
          {param.enum.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          type={param.type === "integer" ? "number" : "text"}
          dir="ltr"
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={param.example !== undefined ? String(param.example) : undefined}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={controlClass}
        />
      )}
      {error && (
        <p id={errorId} className="mt-1 text-xs text-danger-ink">
          {error}
        </p>
      )}
    </div>
  );
}
