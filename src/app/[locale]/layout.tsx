import type { CSSProperties } from "react";
import type { Metadata, Viewport } from "next";
import { Assistant, JetBrains_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import Script from "next/script";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { withBasePath } from "@/lib/base-path";
import { SiteHeader } from "@/components/shell/site-header";
import { THEME_INIT_SCRIPT } from "@/components/shell/theme";
import "../globals.css";

const assistant = Assistant({
  subsets: ["latin"],
  variable: "--font-assistant",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: { default: t("title"), template: `%s · ${t("title")}` },
    description: t("description"),
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfcfe" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0e14" },
  ],
};

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "nav" });

  return (
    <html
      lang={locale}
      dir="ltr"
      className={`${assistant.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/*
          Must run before paint (sets d.dataset.theme synchronously to avoid a
          flash of the wrong theme), so `beforeInteractive`, not a client
          component. Next's <Script> renders this the same way a raw <script>
          tag would, but through Next's own script-injection path — a plain
          <script dangerouslySetInnerHTML> here triggered a dev-only React
          warning ("Encountered a script tag while rendering") on any page
          that hits the not-found boundary (confirmed dev-only: production
          builds never showed it).
        */}
        <Script id="theme-init" strategy="beforeInteractive">
          {THEME_INIT_SCRIPT}
        </Script>
      </head>
      <body
        className="antialiased"
        style={{ "--brand-logo": `url("${withBasePath("/brand/1com-logo.png")}")` } as CSSProperties}
      >
        <NextIntlClientProvider>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-ink"
          >
            {t("skip")}
          </a>
          <SiteHeader />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
