import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PlaygroundApp } from "@/components/playground/playground-app";
import { PrototypeBanner, UntranslatedBanner } from "@/components/ui/prototype-banner";
import { apis, getApi, getEndpoint, listEndpoints } from "@/content";
import { buildPlaygroundSamples } from "@/lib/playground-index";
import { listLiveTargetIds } from "@/server/playground/allowlist";
import { getPlaygroundConfig } from "@/server/playground/config";

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

  const requested = typeof endpointParam === "string" ? endpointParam.split("/") : [];
  const requestedApi = requested.length === 2 ? getApi(requested[0]) : undefined;
  const requestedEndpoint =
    requested.length === 2 ? getEndpoint(requested[0], requested[1]) : undefined;
  // The requested endpoint's own API, not always apis[0] — otherwise a
  // Try It link from a non-default API would render with the wrong API's
  // samples and base URL.
  const api = requestedApi ?? apis[0];
  const endpoint = requestedEndpoint ?? listEndpoints(api)[0];

  const samplesByEndpoint = await buildPlaygroundSamples(api);
  // Read per request (this page is dynamic), so the kill switch applies without a rebuild.
  const liveEndpointIds = getPlaygroundConfig().liveEnabled ? listLiveTargetIds() : [];

  return (
    <div className="flex min-h-[calc(100dvh-57px)] flex-col">
      <div className="space-y-2 px-4 py-3 sm:px-6 lg:px-10">
        {api.synthetic && <PrototypeBanner />}
        {locale !== "en" && <UntranslatedBanner />}
      </div>
      <PlaygroundApp
        api={api}
        initialEndpoint={endpoint}
        samplesByEndpoint={samplesByEndpoint}
        liveEndpointIds={liveEndpointIds}
      />
    </div>
  );
}
