import { useTranslations } from "next-intl";
import { Suspense } from "react";
import { Link } from "@/i18n/navigation";
import { getSearchIndex } from "@/lib/search-index";
import { ConsoleButton } from "./console-button";
import { LocaleSwitch } from "./locale-switch";
import { MobileNav } from "./mobile-nav";
import { mainNav } from "./nav-config";
import { NavLink } from "./nav-link";
import { SearchPalette } from "./search-palette";
import { GuidesNav, ReferenceNav } from "./sidebar-nav";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  const t = useTranslations("nav");
  const index = getSearchIndex();

  return (
    <header className="sticky top-0 z-30 bg-bg">
      <div className="flex h-14 items-center gap-2 border-b border-border px-3 sm:px-4 lg:px-6">
        <MobileNav>
          <nav aria-label={t("mainNav")} className="space-y-6">
            <ul className="space-y-0.5">
              {mainNav.map((item) => (
                <li key={item.key}>
                  <NavLink
                    href={item.href}
                    match="prefix"
                    className="flex min-h-10 items-center rounded-md px-2 text-base font-semibold text-ink hover:bg-surface-2 aria-[current]:text-accent"
                  >
                    {t(item.key)}
                  </NavLink>
                </li>
              ))}
            </ul>
            <div className="sm:hidden">
              <Suspense fallback={null}>
                <LocaleSwitch />
              </Suspense>
            </div>
            <section className="border-t border-border pt-4">
              <h2 className="mb-2 px-2 text-xs font-semibold text-ink-muted">{t("guides")}</h2>
              <GuidesNav />
            </section>
            <section className="border-t border-border pt-4">
              <h2 className="mb-3 px-2 text-xs font-semibold text-ink-muted">{t("reference")}</h2>
              <ReferenceNav idPrefix="drawer" />
            </section>
          </nav>
        </MobileNav>
        <Link
          href="/"
          aria-label={t("home")}
          className="flex shrink-0 items-center gap-2 rounded-sm text-ink"
        >
          <span aria-hidden className="brand-mark block h-[20px] w-[42px]" />
          <span className="text-md font-semibold text-ink-muted">Developers</span>
        </Link>
        <nav aria-label={t("mainNav")} className="ms-6 hidden items-center gap-1 xl:flex">
          {mainNav.map((item) => (
            <NavLink
              key={item.key}
              href={item.href}
              match="prefix"
              className="rounded-md px-2.5 py-1.5 text-sm font-semibold text-ink-muted transition-colors duration-150 hover:text-ink aria-[current]:text-accent"
            >
              {t(item.key)}
            </NavLink>
          ))}
        </nav>
        <div className="ms-auto flex items-center gap-1 sm:gap-2">
          <SearchPalette items={index} />
          <div className="hidden sm:block">
            <Suspense fallback={<span className="block h-8 w-[74px]" />}>
              <LocaleSwitch />
            </Suspense>
          </div>
          <ThemeToggle />
          <ConsoleButton />
        </div>
      </div>
      <div aria-hidden className="signal-hairline h-px" />
    </header>
  );
}
