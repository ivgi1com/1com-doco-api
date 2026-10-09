import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CodeBlock } from "@/components/code/code-block";
import { InlineMarkup } from "@/components/reference/inline-markup";
import { LifecycleBadge } from "@/components/ui/lifecycle-badge";
import { MethodBadge } from "@/components/ui/method-badge";
import { PrototypeBanner } from "@/components/ui/prototype-banner";
import { apis, getApi, listEndpoints, menuGroups, type Endpoint } from "@/content";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { buildSample } from "@/lib/code-samples";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => apis.map((api) => ({ locale, api: api.id })));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProps<"/[locale]/reference/[api]">): Promise<Metadata> {
  const { api } = await params;
  const a = getApi(api);
  return a ? { title: a.name } : {};
}

export default async function ApiOverview({ params }: PageProps<"/[locale]/reference/[api]">) {
  const { locale, api: apiId } = await params;
  setRequestLocale(locale);
  const api = getApi(apiId);
  if (!api) notFound();
  const t = await getTranslations("endpoint");
  const tn = await getTranslations("nav");
  const quickstartEndpoint = listEndpoints(api)[0];
  const quickstartSample = quickstartEndpoint
    ? buildSample(quickstartEndpoint, api.baseUrl, "curl")
    : null;

  return (
    <div className="mx-auto w-full max-w-[56rem] space-y-10 px-4 pb-16 pt-8 sm:px-6 lg:px-10">
      <header className="space-y-4">
        <div className="space-y-2">
          {api.synthetic && <PrototypeBanner />}
        </div>
        <p className="text-sm font-semibold text-ink-muted">{tn("overview")}</p>
        <h1 className="text-2xl font-bold text-ink">
          {api.name}{" "}
          <span dir="ltr" className="font-mono text-lg font-normal text-ink-muted">
            {api.version}
          </span>
        </h1>
        <p dir="auto" className="max-w-[70ch] text-md text-ink-muted">
          {api.summary}
        </p>
      </header>

      <section aria-labelledby="base-url" className="space-y-3">
        <h2 id="base-url" className="text-xl font-semibold text-ink">
          Base URL
        </h2>
        <CodeBlock code={api.baseUrl} lang="bash" title="base url" />
      </section>

      {quickstartEndpoint && quickstartSample && (
        <section aria-labelledby="auth" className="space-y-3">
          <h2 id="auth" className="text-xl font-semibold text-ink">
            {t("security")}
          </h2>
          <p dir="auto" className="max-w-[70ch] text-ink">
            <InlineMarkup text={quickstartEndpoint.authentication.description} />
          </p>
          <CodeBlock code={quickstartSample} lang="bash" title="shell" />
        </section>
      )}

      {menuGroups(api, { includeHidden: true }).map((group) => (
        <section key={group.id} aria-labelledby={`cat-${group.id}`} className="space-y-3">
          <h2 id={`cat-${group.id}`} className="text-xl font-semibold text-ink">
            {group.title}
          </h2>
          {endpointRows(api.id, group.categories.flatMap((c) => c.endpoints))}
        </section>
      ))}
    </div>
  );
}

function endpointRows(apiId: string, endpoints: Endpoint[]) {
  return (
    <ul className="divide-y divide-border border-y border-border">
      {endpoints.map((e) => (
        <li key={e.id}>
          <Link
            href={`/reference/${apiId}/${e.id}`}
            className="group grid gap-x-4 gap-y-1 py-3 sm:grid-cols-[minmax(0,16rem)_1fr] sm:items-center"
          >
            <span className="flex items-center gap-2">
              <span className="font-semibold text-ink group-hover:text-accent">{e.title}</span>
              <LifecycleBadge status={e.status} />
            </span>
            <span dir="ltr" className="flex min-w-0 items-center gap-2 justify-self-start">
              <MethodBadge method={e.method} size="sm" />
              <code className="truncate font-mono text-sm text-ink-muted">{e.path}</code>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
