"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const short: Record<string, string> = { en: "EN", he: "עב" };

export function LocaleSwitch() {
  const t = useTranslations("locale");
  const active = useLocale();
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const href = search ? `${pathname}?${search}` : pathname;

  return (
    <nav aria-label={t("label")} className="flex items-center rounded-md border border-border p-0.5 text-xs font-semibold">
      {routing.locales.map((locale) => (
        <Link
          key={locale}
          href={href}
          locale={locale}
          lang={locale}
          aria-current={locale === active ? "true" : undefined}
          aria-label={t(locale)}
          className="rounded-[3px] px-2 py-1 text-ink-muted transition-colors duration-150 hover:text-ink aria-[current]:bg-accent-tint aria-[current]:text-accent"
        >
          {short[locale]}
        </Link>
      ))}
    </nav>
  );
}
