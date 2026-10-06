import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import "../globals.css";
import { hindSiliguri, inter } from "../fonts";
import AppProviders from "@/providers/app-providers";
import { PUBLIC_CLIENT_MESSAGES, pickMessages } from "@/i18n/client-messages";
import { siteMetadata } from "@/lib/metadata";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: "#0F6B4F",
};

// Site-wide metadata: title template ("Page | Site"), description, icons,
// Open Graph and Twitter cards. Each page adds its own title (src/lib/metadata.ts).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return siteMetadata(hasLocale(routing.locales, locale) ? locale : routing.defaultLocale);
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
        {/* Only what the public client parts need; the signed-in area adds the rest. */}
        <NextIntlClientProvider locale={locale} messages={pickMessages(messages, PUBLIC_CLIENT_MESSAGES)}>
          {/* Each layout renders its own <main>; one here would nest them. */}
          <AppProviders>{children}</AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
