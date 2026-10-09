import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { GuideBody } from "@/components/guides/guide-body";
import { PrototypeBanner } from "@/components/ui/prototype-banner";
import { getGuide, guides } from "@/content/guides";
import { routing } from "@/i18n/routing";
import { customerText } from "@/lib/customer-text";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => guides.map((g) => ({ locale, slug: g.slug })));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/guides/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  return guide ? { title: customerText(guide.title), description: customerText(guide.summary) } : {};
}

/** Generic guide page: all content, including which API it documents, comes from the guide module. */
export default async function GuidePage({ params }: PageProps<"/[locale]/guides/[slug]">) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const guide = getGuide(slug);
  if (!guide) notFound();

  const t = await getTranslations("guide");

  return (
    <div className="mx-auto w-full max-w-[84rem] px-4 pb-16 pt-8 sm:px-6 lg:px-10">
      <div className="grid grid-cols-1 gap-x-10 gap-y-8 xl:grid-cols-[minmax(0,1fr)_16rem]">
        <article dir="auto" className="min-w-0 max-w-[70ch] space-y-8">
          <header className="space-y-3">
            <div className="space-y-2">
              {guide.synthetic && <PrototypeBanner />}
            </div>
            <h1 className="text-2xl font-bold text-ink">{customerText(guide.title)}</h1>
            <p className="text-md text-ink-muted">{customerText(guide.summary)}</p>
          </header>

          <GuideBody guide={guide} />
        </article>

        <aside className="hidden xl:block">
          <nav aria-label={t("onThisPage")} className="sticky top-[81px] space-y-1 border-s border-border ps-4 text-sm">
            <p className="mb-2 text-xs font-semibold text-ink-muted">{t("onThisPage")}</p>
            {guide.sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="block py-0.5 text-ink-muted hover:text-ink">
                {customerText(s.title)}
              </a>
            ))}
          </nav>
        </aside>
      </div>
    </div>
  );
}
