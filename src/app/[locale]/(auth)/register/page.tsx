import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LogIn } from "lucide-react";

import { Link } from "@/i18n/navigation";

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Auth" });

  return {
    title: `${t("registerTitle")} — ${t("metaTitleSuffix")}`,
    description: t("registerSubtitle"),
  };
}

// There is no online sign-up: the samiti office opens every membership
// (Members → Add member), and the login account is made with it. This page
// says so instead of showing a form that could not be sent anywhere.
export default async function RegisterPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Auth" });
  const steps = [t("registerStep1"), t("registerStep2"), t("registerStep3")];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="mt-2 text-2xl font-bold text-app-text">{t("registerTitle")}</h1>
        <p className="mt-1.5 text-sm text-app-text-muted">{t("registerSubtitle")}</p>
      </div>

      <ol className="space-y-3">
        {steps.map((step, index) => (
          <li key={step} className="flex items-start gap-3 rounded-xl border border-app-border bg-app-surface p-3 text-sm text-app-text">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-app-primary text-xs font-bold text-white">
              {index + 1}
            </span>
            <span className="pt-1">{step}</span>
          </li>
        ))}
      </ol>

      <Link
        href="/login"
        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-app-primary px-5 text-sm font-semibold text-white hover:bg-app-primary-hover"
      >
        <LogIn aria-hidden="true" className="h-4 w-4" />
        {t("registerToLogin")}
      </Link>
    </div>
  );
}
