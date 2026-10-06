import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { routing } from "@/i18n/routing";

// One place for page metadata. The root layout sets the site-wide parts
// (title template, icons, Open Graph, Twitter); a page only names its title,
// and a public page also gets canonical/hreflang links and its own share card.

export type PageTitleKey =
  | "login"
  | "register"
  | "dashboard"
  | "members"
  | "pendingMembers"
  | "collections"
  | "cashBook"
  | "passbook"
  | "societyEntries"
  | "ledgerHeads"
  | "openingBalances"
  | "loans"
  | "reports"
  | "yearEnd"
  | "admins"
  | "settings"
  | "profile"
  | "mySavings"
  | "myLoans"
  | "applyLoan"
  | "depositRequest"
  | "membership"
  | "unauthorized"
  | "notFound";

type LocaleParams = { params: Promise<{ locale: string }> };

const OG_IMAGE = { url: "/branding/og-image.png", width: 1200, height: 630 };
const OG_LOCALES: Record<string, string> = { bn: "bn_BD", en: "en_US" };

// Absolute base for canonical and share URLs. Set NEXT_PUBLIC_SITE_URL in production.
export function getSiteUrl(): URL {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return new URL(configured);
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return new URL(`https://${vercel}`);
  return new URL("http://localhost:3000");
}

/** `path` is the route without the locale, e.g. "" for home or "/login". */
export function localeAlternates(locale: string, path: string): Metadata["alternates"] {
  const languages: Record<string, string> = Object.fromEntries(
    routing.locales.map((item) => [item, `/${item}${path}`]),
  );
  languages["x-default"] = `/${routing.defaultLocale}${path}`;
  return { canonical: `/${locale}${path}`, languages };
}

/** Site-wide metadata for the root layout. */
export async function siteMetadata(locale: string): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const siteName = t("siteName");

  return {
    metadataBase: getSiteUrl(),
    applicationName: siteName,
    title: { default: t("homeTitle"), template: `%s | ${siteName}` },
    description: t("description"),
    icons: {
      icon: [
        { url: "/branding/favicon-16.png", sizes: "16x16", type: "image/png" },
        { url: "/branding/favicon-32.png", sizes: "32x32", type: "image/png" },
        { url: "/branding/favicon-48.png", sizes: "48x48", type: "image/png" },
        { url: "/branding/icon-192.png", sizes: "192x192", type: "image/png" },
      ],
      apple: [{ url: "/branding/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
    formatDetection: { telephone: false, email: false, address: false },
    ...shareCards(locale, siteName, t("homeTitle"), t("description"), t("ogImageAlt")),
  };
}

/** Indexable public page: title, description, canonical/hreflang and share cards. */
export function publicPageMetadata(
  key: "home" | PageTitleKey,
  path: string,
  describe?: (locale: string) => Promise<string>,
) {
  return async ({ params }: LocaleParams): Promise<Metadata> => {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "Metadata" });
    const siteName = t("siteName");
    const description = describe ? await describe(locale) : t("description");
    const fullTitle = key === "home" ? t("homeTitle") : `${t(`pages.${key}`)} | ${siteName}`;

    return {
      title: key === "home" ? { absolute: fullTitle } : t(`pages.${key}`),
      description,
      alternates: localeAlternates(locale, path),
      ...shareCards(locale, siteName, fullTitle, description, t("ogImageAlt"), path),
    };
  };
}

/** Signed-in or utility page: only its title. Robots come from the layout. */
export function pageTitleMetadata(key: PageTitleKey) {
  return async ({ params }: LocaleParams): Promise<Metadata> => {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "Metadata" });
    return { title: t(`pages.${key}`) };
  };
}

function shareCards(
  locale: string,
  siteName: string,
  title: string,
  description: string,
  imageAlt: string,
  path?: string,
): Pick<Metadata, "openGraph" | "twitter"> {
  const image = { ...OG_IMAGE, alt: imageAlt };
  return {
    openGraph: {
      type: "website",
      siteName,
      title,
      description,
      // Only public pages name their own address; private pages share none.
      ...(path === undefined ? {} : { url: `/${locale}${path}` }),
      locale: OG_LOCALES[locale] ?? locale,
      alternateLocale: routing.locales.filter((item) => item !== locale).map((item) => OG_LOCALES[item] ?? item),
      images: [image],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}
