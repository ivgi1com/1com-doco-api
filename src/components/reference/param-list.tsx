import { useTranslations } from "next-intl";
import type { Parameter } from "@/content/types";
import { ChildDisclosure } from "./child-disclosure";
import { InlineMarkup } from "./inline-markup";

/**
 * Parameters as a definition list, not a table (MASTER.md "Tables").
 * Row: name (mono 600) · type pill · Required/Optional, then description and
 * Default / One of / constraints / condition. Nested objects use a
 * deep-linkable "Show child attributes" disclosure.
 */
export function ParamList({
  params,
  anchorPrefix,
  nested = false,
}: {
  params: Parameter[];
  anchorPrefix: string;
  nested?: boolean;
}) {
  const t = useTranslations("endpoint");
  return (
    <dl className={nested ? "" : "border-t border-border"}>
      {params.map((param) => {
        const anchor = `${anchorPrefix}.${param.name}`;
        return (
          <div key={param.name} id={anchor} className="scroll-mt-20 border-b border-border py-3 last:border-b-0">
            <dt className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <a
                href={`#${anchor}`}
                dir="ltr"
                className="font-mono text-[0.9rem] font-semibold text-ink hover:text-accent"
              >
                {param.name}
              </a>
              <span dir="ltr" className="rounded-sm bg-surface-2 px-1.5 font-mono text-xs text-ink-muted">
                {param.type}
              </span>
              {param.required ? (
                <span className="text-xs font-semibold text-danger-ink">{t("required")}</span>
              ) : (
                <span className="text-xs text-ink-muted">{t("optional")}</span>
              )}
            </dt>
            <dd className="mt-1 space-y-1.5 text-sm text-ink">
              <p className="max-w-[70ch]">
                <InlineMarkup text={param.description} />
              </p>
              {param.condition && <p className="text-ink-muted">{param.condition}</p>}
              {(param.default || param.constraints) && (
                <p className="flex flex-wrap gap-x-4 gap-y-1 text-ink-muted">
                  {param.default && (
                    <span>
                      {t("default")}: <code className="prose-code">{param.default}</code>
                    </span>
                  )}
                  {param.constraints && (
                    <span>
                      {t("constraints")}: {param.constraints}
                    </span>
                  )}
                </p>
              )}
              {param.enum && (
                <p className="flex flex-wrap items-center gap-1.5 text-ink-muted">
                  <span>{t("oneOf")}:</span>
                  {param.enum.map((value) => (
                    <code key={value} className="prose-code text-ink">
                      {value}
                    </code>
                  ))}
                </p>
              )}
              {param.children && (
                <ChildDisclosure
                  anchor={anchor}
                  showLabel={t("showChildren")}
                  hideLabel={t("hideChildren")}
                  count={param.children.length}
                >
                  <ParamList params={param.children} anchorPrefix={anchor} nested />
                </ChildDisclosure>
              )}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}
