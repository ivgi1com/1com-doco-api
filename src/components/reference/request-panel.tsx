import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { CodeTabs, type RenderedSample } from "@/components/code/code-tabs";
import { MethodBadge } from "@/components/ui/method-badge";
import type { Endpoint } from "@/content/types";
import { Link } from "@/i18n/navigation";
import { type RenderedResponse, ResponseExamples } from "./response-examples";

export interface RequestPanelData {
  samples: RenderedSample[];
  responses: RenderedResponse[];
  /** Named official examples, rendered in the main column (see EndpointView). */
  examples: {
    title: string;
    description: string;
    keyKind: "tenant" | "global";
    samples: RenderedSample[];
  }[];
}

/** The sticky right column: method/path, request samples, Try link, response example. */
export function RequestPanel({
  apiId,
  endpoint,
  data,
}: {
  apiId: string;
  endpoint: Endpoint;
  data: RequestPanelData;
}) {
  const t = useTranslations("endpoint");
  const fixedQueryString = endpoint.fixedQuery
    ? `?${Object.entries(endpoint.fixedQuery)
        .map(([k, v]) => `${k}=${v}`)
        .join("&")}`
    : "";
  return (
    <div className="space-y-3">
      <div dir="ltr" className="flex items-center gap-2 rounded-md border border-border bg-surface-2 px-3 py-2">
        <MethodBadge method={endpoint.method} />
        <code className="min-w-0 flex-1 truncate font-mono text-sm text-ink">
          {endpoint.path}
          {fixedQueryString}
        </code>
      </div>
      <CodeTabs samples={data.samples} />
      {endpoint.operationClass === "write" ? (
        <p data-testid="reference-only" className="rounded-md border border-border px-3 py-2 text-xs text-ink-muted">
          {t("referenceOnly")}
        </p>
      ) : (
        <Link
          href={`/playground?endpoint=${apiId}/${endpoint.id}`}
          className="flex h-10 items-center justify-center gap-2 rounded-md bg-accent px-4 text-sm font-semibold text-accent-ink transition-colors duration-150 hover:bg-accent-hover"
        >
          {t("tryIt")}
          <ArrowRight className="size-4" aria-hidden />
        </Link>
      )}
      {data.responses.length > 0 ? (
        <ResponseExamples responses={data.responses} />
      ) : (
        <p className="text-xs text-ink-muted">{t("notDocumented")}</p>
      )}
    </div>
  );
}
