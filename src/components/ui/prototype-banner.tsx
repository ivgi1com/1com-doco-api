import { FlaskConical } from "lucide-react";
import { useTranslations } from "next-intl";

/** Always shown above fabricated prototype content. */
export function PrototypeBanner() {
  const t = useTranslations("prototype");
  return (
    <p className="flex items-start gap-2 rounded-md border border-dashed border-border-control bg-surface-2 px-3 py-2 text-sm text-ink-muted">
      <FlaskConical className="mt-0.5 size-4 shrink-0" aria-hidden />
      {t("banner")}
    </p>
  );
}

export function UntranslatedBanner() {
  const t = useTranslations("prototype");
  return (
    <p className="rounded-md border border-info-ink/25 bg-info-tint px-3 py-2 text-sm text-info-ink">
      {t("untranslated")}
    </p>
  );
}
