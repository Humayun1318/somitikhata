import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { hasLocale } from "next-intl";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";
import { hindSiliguri, inter } from "../fonts";
import AppProviders from "@/providers/app-providers";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Browser tab, home-screen and PWA icons (public/branding, sized per file name).
// /favicon.ico (src/app/favicon.ico) covers browsers that ask for it directly.
const icons: Metadata["icons"] = {
  icon: [
    { url: "/branding/favicon-16.png", sizes: "16x16", type: "image/png" },
    { url: "/branding/favicon-32.png", sizes: "32x32", type: "image/png" },
    { url: "/branding/favicon-48.png", sizes: "48x48", type: "image/png" },
    { url: "/branding/icon-192.png", sizes: "192x192", type: "image/png" },
  ],
  apple: [{ url: "/branding/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
};

export const viewport: Viewport = {
  themeColor: "#0F6B4F",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (locale === "bn") {
    return {
      icons,
      title: "বটতলী সমবায় — লোহাগাড়া",
      description:
        "লোহাগাড়া বটতলী ব্যবসায়ী কল্যাণ সমবায় সমিতির সদস্য, সঞ্চয়, ঋণ ও যৌথ সম্পদ ব্যবস্থাপনার ডিজিটাল প্ল্যাটফর্ম।",
    };
  }

  return {
    icons,
    title: "Bottoli Cooperative — Lohagara",
    description:
      "Digital savings, loan, and shared-asset management platform for Bottoli Business Welfare Cooperative Society, Lohagara.",
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Static pages are rendered once per locale; tell next-intl which one.
  setRequestLocale(locale);
  const messages = await getMessages({ locale });

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${hindSiliguri.variable}`}
    >
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {/* Each layout renders its own <main>; one here would nest them. */}
          <AppProviders>{children}</AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
