import { AlertTriangle, CircleAlert, Info, Lightbulb } from "lucide-react";
import type { ReactNode } from "react";

type Kind = "note" | "tip" | "warning" | "danger";

const config: Record<Kind, { icon: typeof Info; className: string }> = {
  note: { icon: Info, className: "bg-info-tint border-info-ink/25 text-info-ink" },
  tip: { icon: Lightbulb, className: "bg-success-tint border-success-ink/25 text-success-ink" },
  warning: { icon: AlertTriangle, className: "bg-warning-tint border-warning-ink/30 text-warning-ink" },
  danger: { icon: CircleAlert, className: "bg-danger-tint border-danger-ink/25 text-danger-ink" },
};

/** Tint + full hairline + icon. Never a side stripe. */
export function Callout({
  kind = "note",
  title,
  children,
  className = "",
}: {
  kind?: Kind;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  const { icon: Icon, className: tone } = config[kind];
  return (
    <div role="note" className={`flex gap-3 rounded-md border px-4 py-3 text-sm ${tone} ${className}`}>
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="min-w-0 text-ink [&_a]:text-accent [&_a]:underline">
        {title && <p className="font-semibold">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  );
}
