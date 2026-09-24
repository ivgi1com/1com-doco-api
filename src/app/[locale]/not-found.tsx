import { CompassIcon } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function LocaleNotFound() {
  const locale = await getLocale();
  setRequestLocale(locale);
  const t = await getTranslations("notFound");

  return (
    <div className="mx-auto flex min-h-[60dvh] w-full max-w-[56rem] flex-col items-center justify-center gap-3 px-4 text-center sm:px-6 lg:px-10">
      <CompassIcon className="size-8 text-ink-muted" aria-hidden />
      <h1 className="text-2xl font-bold text-ink">{t("title")}</h1>
      <p className="max-w-[44ch] text-sm text-ink-muted">{t("body")}</p>
      <Link
        href="/"
        className="mt-2 flex h-10 items-center rounded-md bg-accent px-4 text-sm font-semibold text-accent-ink transition-colors duration-150 hover:bg-accent-hover"
      >
        {t("home")}
      </Link>
    </div>
  );
}
