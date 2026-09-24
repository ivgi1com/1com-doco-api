import { History } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function ChangelogPage({ params }: PageProps<"/[locale]/changelog">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("changelog");

  return (
    <div className="mx-auto flex w-full max-w-[56rem] flex-col items-center gap-3 px-4 py-24 text-center sm:px-6 lg:px-10">
      <h1 className="text-2xl font-bold text-ink">{t("title")}</h1>
      <div className="mt-4 flex flex-col items-center gap-2">
        <History className="size-6 text-ink-muted" aria-hidden />
        <p className="text-sm font-semibold text-ink">{t("emptyTitle")}</p>
        <p className="max-w-[40ch] text-sm text-ink-muted">{t("emptyBody")}</p>
      </div>
    </div>
  );
}
