import { useTranslations } from "next-intl";
import { InlineMarkup } from "@/components/reference/inline-markup";
import type { Endpoint } from "@/content/types";

/**
 * What the selected operation is, before any field: its summary, whether it
 * reads or changes state, and how it authenticates and at what key scope.
 * Everything comes from the content model (no per-API logic), so Proxy,
 * OpenAPI and the Sample API render the same way.
 */
export function OperationHeader({ endpoint }: { endpoint: Endpoint }) {
  const t = useTranslations("playground");
  const { authentication: auth } = endpoint;
  const write = endpoint.operationClass === "write";
  const authText =
    auth.location === "query" && auth.parameter
      ? t("authQuery", { parameter: auth.parameter })
      : auth.parameter
        ? t("authHeader", { parameter: auth.parameter })
        : t("authBearer");

  return (
    <header data-testid="operation-header" className="space-y-1.5">
      <h2 dir="auto" className="text-sm font-semibold text-ink">
        {endpoint.title}
      </h2>
      <p dir="auto" className="text-xs text-ink-muted">
        <InlineMarkup text={endpoint.summary} />
      </p>
      <ul className="flex flex-wrap gap-1.5 text-[11px] font-medium text-ink-muted">
        <li
          data-testid="op-kind"
          className={`rounded-full border px-2 py-0.5 ${write ? "border-warning-ink/30 bg-warning-tint text-warning-ink" : "border-border-control"}`}
        >
          {write ? t("opWrite") : t("opRead")}
        </li>
        <li className="rounded-full border border-border-control px-2 py-0.5" dir="auto">
          {authText}
        </li>
      </ul>
    </header>
  );
}
