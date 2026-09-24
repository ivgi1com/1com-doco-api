import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CodeBlock } from "@/components/code/code-block";
import { PrototypeBanner, UntranslatedBanner } from "@/components/ui/prototype-banner";
import { getApi } from "@/content";
import { getGuide, guides } from "@/content/guides";
import { routing } from "@/i18n/routing";
import { API_KEY_ENV } from "@/lib/code-samples";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => guides.map((g) => ({ locale, slug: g.slug })));
}

export const dynamicParams = false;

const sections = [
  { id: "create-a-key", title: "Create an API key" },
  { id: "first-request", title: "Send your first request" },
  { id: "read-the-response", title: "Read the response" },
  { id: "handle-errors", title: "Handle errors" },
] as const;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/guides/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  return guide ? { title: guide.title, description: guide.summary } : {};
}

export default async function GuidePage({ params }: PageProps<"/[locale]/guides/[slug]">) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const guide = getGuide(slug);
  if (!guide) notFound();

  const t = await getTranslations("guide");
  // This guide's steps (bearer auth, /v1/call-records, its error shape) are
  // written for the Sample API specifically, not "whichever API is first" —
  // pin it by id rather than reading apis[0].
  const api = getApi("sample")!;
  const base = api.baseUrl;

  return (
    <div className="mx-auto w-full max-w-[84rem] px-4 pb-16 pt-8 sm:px-6 lg:px-10">
      <div className="grid gap-x-10 gap-y-8 xl:grid-cols-[minmax(0,1fr)_16rem]">
        <article lang="en" dir="auto" className="min-w-0 max-w-[70ch] space-y-8">
          <header className="space-y-3">
            <div className="space-y-2">
              {guide.synthetic && <PrototypeBanner />}
              {locale !== "en" && <UntranslatedBanner />}
            </div>
            <h1 className="text-2xl font-bold text-ink">{guide.title}</h1>
            <p className="text-md text-ink-muted">{guide.summary}</p>
          </header>

          <section id={sections[0].id} aria-labelledby={`${sections[0].id}-h`} className="scroll-mt-20 space-y-3">
            <h2 id={`${sections[0].id}-h`} className="text-xl font-semibold text-ink">
              {sections[0].title}
            </h2>
            <p>
              Every request authenticates with a tenant API key sent as a bearer token. Create a key for your
              tenant and store it in an environment variable — never commit it to source control.
            </p>
            <CodeBlock code={`export ${API_KEY_ENV}="<YOUR_API_KEY>"`} lang="bash" title="shell" />
          </section>

          <section id={sections[1].id} aria-labelledby={`${sections[1].id}-h`} className="scroll-mt-20 space-y-3">
            <h2 id={`${sections[1].id}-h`} className="text-xl font-semibold text-ink">
              {sections[1].title}
            </h2>
            <p>
              List the tenant&rsquo;s recent call records with a single authenticated <code className="prose-code">GET</code>{" "}
              request:
            </p>
            <CodeBlock
              code={`curl "${base}/v1/call-records?limit=5" \\\n  -H "Authorization: Bearer $${API_KEY_ENV}"`}
              lang="bash"
              title="shell"
            />
          </section>

          <section id={sections[2].id} aria-labelledby={`${sections[2].id}-h`} className="scroll-mt-20 space-y-3">
            <h2 id={`${sections[2].id}-h`} className="text-xl font-semibold text-ink">
              {sections[2].title}
            </h2>
            <p>
              A successful response returns a page of call records and a cursor for the next page. The full field
              reference is in <code className="prose-code">List call records</code> under API Reference.
            </p>
            <CodeBlock
              code={`{\n  "data": [\n    {\n      "id": "call_0001",\n      "direction": "inbound",\n      "status": "completed"\n    }\n  ],\n  "next_cursor": "cur_sample_2"\n}`}
              lang="json"
              title="200 response"
            />
          </section>

          <section id={sections[3].id} aria-labelledby={`${sections[3].id}-h`} className="scroll-mt-20 space-y-3">
            <h2 id={`${sections[3].id}-h`} className="text-xl font-semibold text-ink">
              {sections[3].title}
            </h2>
            <p>
              Errors use standard HTTP status codes with a JSON body describing what went wrong. A missing or
              invalid key returns <code className="prose-code">401</code>; check the error code before retrying.
            </p>
            <CodeBlock
              code={`{\n  "error": {\n    "code": "unauthorized",\n    "message": "The API key is missing or invalid.",\n    "request_id": "req_sample_7f3a"\n  }\n}`}
              lang="json"
              title="401 response"
            />
          </section>
        </article>

        <aside className="hidden xl:block">
          <nav aria-label={t("onThisPage")} className="sticky top-[81px] space-y-1 border-s border-border ps-4 text-sm">
            <p className="mb-2 text-xs font-semibold text-ink-muted">{t("onThisPage")}</p>
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="block py-0.5 text-ink-muted hover:text-ink">
                {s.title}
              </a>
            ))}
          </nav>
        </aside>
      </div>
    </div>
  );
}
