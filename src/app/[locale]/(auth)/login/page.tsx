import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LoginForm } from "@/components/auth/login-form";


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Auth" });

  return {
    title: `${t("loginTitle")} — ${t("metaTitleSuffix")}`,
    description: t("loginSubtitle"),
  };
}

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Auth" });

  return (
    <>
      {/* <AuthHeader title={t('loginTitle')} subtitle={t('loginSubtitle')} /> */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-app-text">{t("loginTitle")}</h1>
        <p className="mt-1.5 text-sm text-app-text-muted">
          {t("loginSubtitle")}
        </p>
      </div>
      <LoginForm />
    </>
  );
}
