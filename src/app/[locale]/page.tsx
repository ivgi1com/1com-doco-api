import { ArrowRight, BookOpen, FlaskConical, Library, Zap } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { apis } from "@/content";
import { Link } from "@/i18n/navigation";
import { PrototypeBanner } from "@/components/ui/prototype-banner";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const tn = await getTranslations("nav");
  const api = apis[0];

  const cards = [
    { href: "/guides/most-used-cases", icon: Zap, title: t("mostUsedTitle"), body: t("mostUsedBody") },
    { href: "/reference", icon: Library, title: t("referenceTitle"), body: t("referenceBody") },
    { href: "/guides", icon: BookOpen, title: t("guidesTitle"), body: t("guidesBody") },
    { href: "/playground", icon: FlaskConical, title: t("playgroundTitle"), body: t("playgroundBody") },
  ] as const;

  return (
    <div className="mx-auto w-full max-w-[64rem] space-y-12 px-4 pb-20 pt-10 sm:px-6 lg:px-10">
      <div className="space-y-3">
        {api.synthetic && <PrototypeBanner />}
      </div>

      <header className="space-y-4">
        <h1 className="max-w-[24ch] text-3xl font-bold text-ink">{t("title")}</h1>
        <p className="max-w-[60ch] text-md text-ink-muted">{t("lead")}</p>
        <div className="flex flex-wrap gap-3 pt-1">
          <Link
            href="/guides/openapi-authentication"
            className="flex h-10 items-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-accent-ink transition-colors duration-150 hover:bg-accent-hover"
          >
            {t("startGuide")}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
          <Link
            href="/reference"
            className="flex h-10 items-center rounded-md border border-border-control px-4 text-sm font-semibold text-ink transition-colors duration-150 hover:bg-surface-2"
          >
            {t("openReference")}
          </Link>
        </div>
      </header>

      <nav aria-label={t("entriesLabel")} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ href, icon: Icon, title, body }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col gap-2 rounded-lg border border-border p-4 transition-colors duration-150 hover:border-border-control"
          >
            <Icon className="size-5 text-accent" aria-hidden />
            <span className="font-semibold text-ink group-hover:text-accent">{title}</span>
            <span className="text-sm text-ink-muted">{body}</span>
          </Link>
        ))}
      </nav>

      <div aria-label={t("apisLabel")} className="flex flex-wrap items-center gap-2 border-t border-border pt-6">
        <span className="text-xs font-semibold text-ink-muted">{tn("api")}</span>
        {apis
          .filter((a) => !a.synthetic)
          .map((a) => (
            <Link
              key={a.id}
              href={`/reference/${a.id}`}
              className="rounded-sm border border-accent/40 bg-accent-tint px-2 py-0.5 text-xs font-semibold text-accent hover:border-accent"
            >
              {a.legacy ? tn("legacyApi", { name: a.name }) : a.name}
            </Link>
          ))}
      </div>
    </div>
  );
}
