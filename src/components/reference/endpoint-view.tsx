import { ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { Callout } from "@/components/ui/callout";
import { LifecycleBadge } from "@/components/ui/lifecycle-badge";
import { MethodBadge } from "@/components/ui/method-badge";
import { PrototypeBanner, UntranslatedBanner } from "@/components/ui/prototype-banner";
import { getEndpoint } from "@/content";
import type { ApiDefinition, Endpoint } from "@/content/types";
import { Link } from "@/i18n/navigation";
import { Feedback } from "./feedback";
import { InlineMarkup } from "./inline-markup";
import { ParamList } from "./param-list";
import { RequestPanel, type RequestPanelData } from "./request-panel";

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="scroll-mt-20">
      <h2 id={id} className="mb-3 text-xl font-semibold text-ink">
        <a href={`#${id}`} className="hover:text-accent">
          {title}
        </a>
      </h2>
      {children}
    </section>
  );
}

function statusInk(status: number) {
  if (status < 300) return "text-success-ink";
  if (status < 500) return "text-warning-ink";
  return "text-danger-ink";
}

/** Prose that comes from API content (English until the Hebrew scope is decided). */
function ContentText({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p lang="en" dir="auto" className={className}>
      {children}
    </p>
  );
}

export function EndpointView({
  api,
  endpoint,
  panel,
}: {
  api: ApiDefinition;
  endpoint: Endpoint;
  panel: RequestPanelData;
}) {
  const t = useTranslations("endpoint");
  const tn = useTranslations("nav");
  const locale = useLocale();
  const category = api.categories.find((c) => c.id === endpoint.category);
  const replacement = endpoint.deprecation?.replacement
    ? getEndpoint(api.id, endpoint.deprecation.replacement)
    : undefined;
  const successSchema = endpoint.responses.find((r) => r.status < 300 && r.schema);

  return (
    <div className="mx-auto w-full max-w-[84rem] px-4 pb-16 pt-6 sm:px-6 lg:px-10">
      <nav aria-label={tn("breadcrumb")} className="mb-5 text-sm text-ink-muted">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/reference" className="hover:text-ink">
              {tn("reference")}
            </Link>
          </li>
          <li className="flex items-center gap-1">
            <ChevronRight className="icon-directional size-3.5" aria-hidden />
            <Link href={`/reference/${api.id}`} className="hover:text-ink">
              {api.name}
            </Link>
          </li>
          {category && (
            <li className="flex items-center gap-1" aria-current="page">
              <ChevronRight className="icon-directional size-3.5" aria-hidden />
              <span lang="en">{category.title}</span>
            </li>
          )}
        </ol>
      </nav>

      <div className="grid gap-x-10 gap-y-8 md:grid-cols-[minmax(0,1fr)_20rem] lg:grid-cols-[minmax(0,1fr)_24rem] 2xl:grid-cols-[minmax(0,1fr)_28rem]">
        <article className="min-w-0 space-y-10">
          <header className="space-y-4">
            <div className="space-y-2">
              {api.synthetic && <PrototypeBanner />}
              {locale !== "en" && <UntranslatedBanner />}
            </div>
            {endpoint.status === "deprecated" && endpoint.deprecation && (
              <Callout kind="warning" title={t("deprecatedBanner", { date: endpoint.deprecation.date ?? "" })}>
                <ContentText>
                  {endpoint.deprecation.note}{" "}
                  {replacement && (
                    <>
                      {t.rich("useInstead", {
                        name: replacement.title,
                        link: (chunks) => (
                          <Link href={`/reference/${api.id}/${replacement.id}`}>{chunks}</Link>
                        ),
                      })}
                    </>
                  )}
                </ContentText>
              </Callout>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <h1 lang="en" className="text-2xl font-bold text-ink">
                {endpoint.title}
              </h1>
              <LifecycleBadge status={endpoint.status} />
            </div>
            <p dir="ltr" className="flex items-center gap-2 text-start">
              <MethodBadge method={endpoint.method} />
              <code className="break-all font-mono text-[0.95rem] text-ink">{endpoint.path}</code>
            </p>
            <ContentText className="max-w-[70ch] text-md text-ink-muted">{endpoint.summary}</ContentText>
          </header>

          {/* Mobile: the request panel follows the summary as a disclosure; never removed. */}
          <details className="group rounded-md border border-border md:hidden">
            <summary className="flex h-11 cursor-pointer list-none items-center justify-between px-3 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
              {t("requestExample")}
              <ChevronRight className="icon-directional size-4 transition-transform duration-150 group-open:rotate-90 rtl:group-open:-rotate-90" aria-hidden />
            </summary>
            <div className="border-t border-border p-3">
              <RequestPanel apiId={api.id} endpoint={endpoint} data={panel} />
            </div>
          </details>

          <Section id="authentication" title={t("security")}>
            <div className="rounded-md border border-border px-4 py-3 text-sm">
              <p className="font-semibold text-ink" lang="en">
                {endpoint.authentication.type}
              </p>
              <ContentText className="mt-1 text-ink-muted">
                <InlineMarkup text={endpoint.authentication.description} />
              </ContentText>
            </div>
          </Section>

          {endpoint.pathParameters.length > 0 && (
            <Section id="path-parameters" title={t("pathParams")}>
              <ParamList params={endpoint.pathParameters} anchorPrefix="path" />
            </Section>
          )}
          {endpoint.queryParameters.length > 0 && (
            <Section id="query-parameters" title={t("queryParams")}>
              <ParamList params={endpoint.queryParameters} anchorPrefix="query" />
            </Section>
          )}
          {endpoint.headers.length > 0 && (
            <Section id="headers" title={t("headers")}>
              <ParamList params={endpoint.headers} anchorPrefix="header" />
            </Section>
          )}
          {endpoint.requestBody && (
            <Section id="request-body" title={t("body")}>
              <ParamList params={endpoint.requestBody} anchorPrefix="body" />
            </Section>
          )}

          <Section id="responses" title={t("responses")}>
            <ul className="divide-y divide-border border-y border-border">
              {endpoint.responses.map((r) => (
                <li key={r.status} className="flex gap-4 py-2.5 text-sm">
                  <span dir="ltr" className={`w-10 shrink-0 font-mono font-semibold tabular ${statusInk(r.status)}`}>
                    {r.status}
                  </span>
                  <ContentText className="text-ink">{r.description}</ContentText>
                </li>
              ))}
            </ul>
            {successSchema?.schema && (
              <div className="mt-5">
                <h3 className="mb-2 text-sm font-semibold text-ink-muted">
                  <span dir="ltr" className="font-mono">
                    {successSchema.status}
                  </span>{" "}
                  · {t("body")}
                </h3>
                <ParamList params={successSchema.schema} anchorPrefix={`response-${successSchema.status}`} />
              </div>
            )}
          </Section>

          {endpoint.errors.length > 0 && (
            <Section id="errors" title={t("errors")}>
              <table className="w-full border-collapse text-sm max-sm:block">
                <thead className="bg-surface-2 text-start max-sm:sr-only">
                  <tr className="text-xs text-ink-muted">
                    <th scope="col" className="w-20 px-3 py-2 text-start font-semibold">{t("status")}</th>
                    <th scope="col" className="w-44 px-3 py-2 text-start font-semibold">{t("code")}</th>
                    <th scope="col" className="px-3 py-2 text-start font-semibold">{t("description")}</th>
                  </tr>
                </thead>
                <tbody className="max-sm:block">
                  {endpoint.errors.map((e) => (
                    <tr key={e.code} className="border-b border-border max-sm:grid max-sm:grid-cols-[auto_1fr] max-sm:gap-x-3 max-sm:py-2.5">
                      <td dir="ltr" className={`px-3 py-2.5 text-start font-mono font-semibold tabular max-sm:p-0 ${statusInk(e.status)}`}>
                        {e.status}
                      </td>
                      <td className="px-3 py-2.5 max-sm:p-0">
                        <code className="prose-code">{e.code}</code>
                      </td>
                      <td lang="en" dir="auto" className="px-3 py-2.5 text-ink max-sm:col-span-2 max-sm:mt-1 max-sm:p-0">
                        {e.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          )}

          {endpoint.related.length > 0 && (
            <Section id="related" title={t("related")}>
              <ul className="space-y-1.5">
                {endpoint.related.map((id) => {
                  const rel = getEndpoint(api.id, id);
                  if (!rel) return null;
                  return (
                    <li key={id}>
                      <Link href={`/reference/${api.id}/${id}`} className="group inline-flex items-center gap-2 text-sm">
                        <MethodBadge method={rel.method} size="sm" />
                        <span lang="en" className="font-semibold text-accent group-hover:underline">
                          {rel.title}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </Section>
          )}

          <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
            <Feedback />
            {!endpoint.verification.verified && (
              <p className="text-xs text-ink-muted">
                {t("verification")}: {t("notVerified")}
              </p>
            )}
          </footer>
        </article>

        <aside className="hidden md:block">
          <div className="sticky top-[81px] max-h-[calc(100dvh-97px)] overflow-y-auto overscroll-contain pb-2">
            <RequestPanel apiId={api.id} endpoint={endpoint} data={panel} />
          </div>
        </aside>
      </div>
    </div>
  );
}
