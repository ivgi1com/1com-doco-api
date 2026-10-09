"use client";

import { BookOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import { apis, getApi, menuGroups } from "@/content";
import { getGuide, guideApis, guidesForApi } from "@/content/guides";
import { MethodBadge } from "@/components/ui/method-badge";
import { LifecycleBadge } from "@/components/ui/lifecycle-badge";
import { usePathname, useRouter } from "@/i18n/navigation";
import { CategoryGroups } from "./category-groups";
import { NavLink } from "./nav-link";

const itemClass =
  "flex min-h-8 items-center gap-2 rounded-md px-2 py-1 text-sm text-ink-muted transition-colors duration-150 hover:bg-surface-2 hover:text-ink aria-[current]:bg-accent-tint aria-[current]:font-semibold aria-[current]:text-accent";

/** Reads the api id from the current path (`/reference/<api>/...`) so the
 * sidebar and mobile drawer always show the API being viewed, not always
 * the first one. Falls back to the first API when not under `/reference`. */
export function ReferenceNav({ idPrefix = "side" }: { idPrefix?: string }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const router = useRouter();
  const detectedId = /^\/reference\/([^/]+)/.exec(pathname)?.[1];
  const api = (detectedId && getApi(detectedId)) || apis[0];
  const activeEndpointId = /^\/reference\/[^/]+\/([^/]+)/.exec(pathname)?.[1];

  return (
    <div className="space-y-5">
      <div className="grid gap-2">
        <label className="sr-only" htmlFor={`${idPrefix}-api-${api.id}`}>
          {t("api")}
        </label>
        <select
          id={`${idPrefix}-api-${api.id}`}
          value={api.id}
          onChange={(e) => router.push(`/reference/${e.target.value}`)}
          className="h-8 min-w-0 rounded-md border border-border-control bg-bg px-2 text-sm font-semibold text-ink"
        >
          {apis.map((a) => (
            <option key={a.id} value={a.id}>
              {a.legacy ? t("legacyApi", { name: a.name }) : a.name}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor={`${idPrefix}-version-${api.id}`}>
          {t("version")}
        </label>
        <select
          id={`${idPrefix}-version-${api.id}`}
          defaultValue={api.version}
          className="h-8 rounded-md border border-border-control bg-bg px-2 font-mono text-xs text-ink"
        >
          <option value={api.version}>
            {api.version} ({t("latest")})
          </option>
        </select>
        <p className="px-0.5 text-xs text-ink-muted">{t("apiHint")}</p>
      </div>

      <div>
        <p className="mb-1 px-2 text-xs font-semibold text-ink-muted">{t("concepts")}</p>
        <NavLink href={`/reference/${api.id}`} className={itemClass}>
          {t("overview")}
        </NavLink>
      </div>

      <CategoryGroups
        key={api.id}
        groups={menuGroups(api)}
        activeEndpointId={activeEndpointId}
        renderEndpoint={(endpoint) => (
          <NavLink href={`/reference/${api.id}/${endpoint.id}`} className={itemClass}>
            <MethodBadge method={endpoint.method} size="sm" />
            <span className="min-w-0 flex-1 truncate">{endpoint.title}</span>
            {endpoint.status !== "stable" && <LifecycleBadge status={endpoint.status} compact />}
          </NavLink>
        )}
      />
    </div>
  );
}

/** Guides for one API at a time. The API comes from the guide being viewed;
 * elsewhere it is the default (first) API. Switching opens that API's first guide. */
export function GuidesNav({ idPrefix = "side" }: { idPrefix?: string }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const router = useRouter();
  const options = guideApis();
  const slug = /^\/guides\/([^/]+)/.exec(pathname)?.[1];
  const apiId = (slug && getGuide(slug)?.apiId) || options[0].id;
  const selectId = `${idPrefix}-guides-api`;

  return (
    <div className="space-y-3">
      <div className="grid gap-2">
        <label className="sr-only" htmlFor={selectId}>
          {t("api")}
        </label>
        <select
          id={selectId}
          value={apiId}
          onChange={(e) => router.push(`/guides/${guidesForApi(e.target.value)[0].slug}`)}
          className="h-8 min-w-0 rounded-md border border-border-control bg-bg px-2 text-sm font-semibold text-ink"
        >
          {options.map((a) => (
            <option key={a.id} value={a.id}>
              {a.legacy ? t("legacyApi", { name: a.name }) : a.name}
            </option>
          ))}
        </select>
        <p className="px-0.5 text-xs text-ink-muted">{t("apiHint")}</p>
      </div>
      <ul className="space-y-0.5">
        {guidesForApi(apiId).map((guide) => (
          <li key={guide.slug}>
            <NavLink href={`/guides/${guide.slug}`} className={itemClass}>
              <BookOpen className="size-4 shrink-0" aria-hidden />
              {guide.title}
            </NavLink>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Desktop sidebar: sticky, independently scrolling, section-scoped. */
export function Sidebar({ section }: { section: "reference" | "guides" }) {
  const t = useTranslations("nav");
  return (
    <aside className="hidden w-64 shrink-0 border-e border-border bg-surface-2 xl:block">
      <nav
        aria-label={t("sectionNav")}
        className="sticky top-[57px] max-h-[calc(100dvh-57px)] overflow-y-auto overscroll-contain px-3 py-5"
      >
        {section === "reference" ? <ReferenceNav /> : <GuidesNav />}
      </nav>
    </aside>
  );
}
