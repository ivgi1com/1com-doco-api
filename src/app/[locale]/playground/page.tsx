import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PlaygroundApp } from "@/components/playground/playground-app";
import { Callout } from "@/components/ui/callout";
import { PrototypeBanner, UntranslatedBanner } from "@/components/ui/prototype-banner";
import { apis, defaultEndpoint, getApi, getEndpoint } from "@/content";
import { buildPlaygroundSamples } from "@/lib/playground-index";
import { listLiveTargetHints, listLiveTargetIds } from "@/server/playground/allowlist";
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
  const t = await getTranslations("playground");
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
  const endpoint = requestedEndpoint ?? defaultEndpoint(api);
  // A deep link that names an endpoint that does not exist falls back to the
  // API's default one, but says so instead of silently showing a different operation.
  const endpointNotFound = typeof endpointParam === "string" && endpointParam !== "" && !requestedEndpoint;

  const samplesByEndpoint = await buildPlaygroundSamples(api);
  // Read per request (this page is dynamic), so the kill switch applies without a rebuild.
  const liveEnabled = getPlaygroundConfig().liveEnabled;
  const liveEndpointIds = liveEnabled ? listLiveTargetIds() : [];
  const liveHints = liveEnabled ? listLiveTargetHints() : {};

  return (
    <div className="flex min-h-[calc(100dvh-57px)] flex-col">
      <div className="space-y-2 px-4 py-3 sm:px-6 lg:px-10">
        {api.synthetic && <PrototypeBanner />}
        {locale !== "en" && <UntranslatedBanner />}
        {endpointNotFound && (
          <Callout kind="warning" title={t("endpointNotFoundTitle")}>
            <p data-testid="endpoint-not-found">
              {t("endpointNotFoundBody", { endpoint: String(endpointParam), fallback: endpoint.title })}
            </p>
          </Callout>
        )}
      </div>
      <PlaygroundApp
        key={api.id}
        api={api}
        initialEndpoint={endpoint}
        samplesByEndpoint={samplesByEndpoint}
        liveEndpointIds={liveEndpointIds}
        liveHints={liveHints}
      />
    </div>
  );
}
