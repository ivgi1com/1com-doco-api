import { useTranslations } from "next-intl";

/**
 * The Console destination is an open item. The control is rendered inert so
 * the header layout can be evaluated without inventing a destination.
 */
export function ConsoleButton() {
  const t = useTranslations("nav");
  return (
    <span className="group relative hidden sm:inline-flex">
      <button
        type="button"
        aria-disabled="true"
        aria-describedby="console-soon"
        className="h-9 cursor-not-allowed rounded-md border border-border px-3 text-sm font-semibold text-ink-muted"
      >
        {t("console")}
      </button>
      <span
        id="console-soon"
        role="tooltip"
        className="pointer-events-none absolute end-0 top-full z-40 mt-2 w-max max-w-56 rounded-md border border-border bg-raised px-2.5 py-1.5 text-xs text-ink opacity-0 shadow-overlay transition-opacity duration-150 group-focus-within:opacity-100 group-hover:opacity-100"
      >
        {t("consoleSoon")}
      </span>
    </span>
  );
}
