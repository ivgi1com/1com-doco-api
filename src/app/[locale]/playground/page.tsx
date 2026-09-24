import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PlaygroundApp } from "@/components/playground/playground-app";
import { PrototypeBanner, UntranslatedBanner } from "@/components/ui/prototype-banner";
import { apis, getEndpoint, listEndpoints } from "@/content";
import { buildPlaygroundSamples } from "@/lib/playground-index";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("playground");
  return { title: t("title") };
}

export default async function PlaygroundPage({
  params,
  searchParams,
}: PageProps<"/[locale]/playground">) {
  const { locale } = await params;
  const { endpoint: endpointParam } = await searchParams;
  setRequestLocale(locale);

  const api = apis[0];
  const requested = typeof endpointParam === "string" ? endpointParam.split("/") : [];
  const requestedEndpoint = requested.length === 2 ? getEndpoint(requested[0], requested[1]) : undefined;
  const endpoint = requestedEndpoint ?? listEndpoints(api)[0];

  const samplesByEndpoint = await buildPlaygroundSamples(api);

  return (
    <div className="flex min-h-[calc(100dvh-57px)] flex-col">
      <div className="space-y-2 px-4 py-3 sm:px-6 lg:px-10">
        {api.synthetic && <PrototypeBanner />}
        {locale !== "en" && <UntranslatedBanner />}
      </div>
      <PlaygroundApp api={api} initialEndpoint={endpoint} samplesByEndpoint={samplesByEndpoint} />
    </div>
  );
}
