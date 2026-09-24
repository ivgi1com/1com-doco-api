import { useTranslations } from "next-intl";
import type { Lifecycle } from "@/content/types";

type NonStable = Exclude<Lifecycle, "stable">;

const styles: Record<NonStable, string> = {
  experimental: "border-info-ink/40 text-info-ink",
  deprecated: "border-warning-ink/50 text-warning-ink",
  legacy: "border-border-control text-ink-muted",
};

const dots: Record<NonStable, string> = {
  experimental: "bg-info-ink",
  deprecated: "bg-warning-ink",
  legacy: "bg-ink-muted",
};

/**
 * Outline badge; `stable` renders nothing (MASTER.md "Lifecycle badges").
 * `compact` renders a status dot for dense navigation rows, with the full
 * label kept for assistive tech and as a tooltip.
 */
export function LifecycleBadge({ status, compact = false }: { status: Lifecycle; compact?: boolean }) {
  const t = useTranslations("lifecycle");
  if (status === "stable") return null;
  const label = t(status);
  if (compact) {
    return (
      <span title={label} className="inline-flex shrink-0 items-center">
        <span aria-hidden className={`size-1.5 rounded-full ${dots[status]}`} />
        <span className="sr-only">({label})</span>
      </span>
    );
  }
  return (
    <span
      className={`badge inline-flex h-5 shrink-0 items-center rounded-sm border px-1.5 text-[11px] font-semibold uppercase leading-none tracking-wide ${styles[status]}`}
    >
      {label}
    </span>
  );
}
