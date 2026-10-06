import type { Metadata } from "next";
import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

// The signed-in area (admin and member).
// - Not for search engines: every page here is private and behind sign-in.
// - Sends all messages to the browser: the pages are interactive Client
//   Components (tables, dialogs, forms) that read most namespaces.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardAreaLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages({ locale });

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
