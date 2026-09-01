import type { Metadata } from "next";
import type { ReactNode } from "react";
import { hasLocale } from "next-intl";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { hindSiliguri, inter } from "../fonts";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (locale === "bn") {
    return {
      title: "বটতলী সমবায় — লোহাগাড়া",
      description:
        "লোহাগাড়া বটতলী ব্যবসায়ী কল্যাণ সমবায় সমিতির সদস্য, সঞ্চয়, ঋণ ও যৌথ সম্পদ ব্যবস্থাপনার ডিজিটাল প্ল্যাটফর্ম।",
    };
  }

  return {
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

  const messages = await getMessages({ locale });

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${hindSiliguri.variable}`}
    >
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
