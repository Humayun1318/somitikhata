"use client";

import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";

// Shown in place of a protected page the signed-in user has no role for.
export function AccessDenied({ homeHref }: { homeHref: string }) {
  const t = useTranslations("Errors");

  return (
    <main className="flex min-h-screen items-center justify-center bg-app-background px-4 py-8 sm:px-6">
      <section
        role="alert"
        className="w-full max-w-md rounded-2xl border border-app-border bg-app-surface p-6 text-center shadow-sm sm:p-8"
      >
        <p className="text-sm font-semibold text-red-600">403</p>
        <h1 className="mt-2 text-xl font-semibold text-app-text">
          {t("forbiddenTitle")}
        </h1>
        <p className="mt-2 text-sm text-app-text-muted">{t("forbidden")}</p>
        <Link
          href={homeHref}
          className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-app-primary px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          {t("backToDashboard")}
        </Link>
      </section>
    </main>
  );
}
