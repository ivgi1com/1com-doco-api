import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { EndpointView } from "@/components/reference/endpoint-view";
import { apis, getApi, getEndpoint, listEndpoints } from "@/content";
import { withObserved } from "@/content/observed";
import { routing } from "@/i18n/routing";
import { buildPanelData } from "@/lib/endpoint-panel";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    apis.flatMap((api) => listEndpoints(api).map((e) => ({ locale, api: api.id, endpoint: e.id }))),
  );
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/reference/[api]/[endpoint]">): Promise<Metadata> {
  const { api, endpoint } = await params;
  const e = getEndpoint(api, endpoint);
  return e ? { title: e.title, description: e.summary } : {};
}

export default async function EndpointPage({ params }: PageProps<"/[locale]/reference/[api]/[endpoint]">) {
  const { locale, api: apiId, endpoint: endpointId } = await params;
  setRequestLocale(locale);
  const api = getApi(apiId);
  const documented = getEndpoint(apiId, endpointId);
  if (!api || !documented) notFound();
  const endpoint = withObserved(apiId, documented);

  const panel = await buildPanelData(api, endpoint);
  return <EndpointView api={api} endpoint={endpoint} panel={panel} />;
}
