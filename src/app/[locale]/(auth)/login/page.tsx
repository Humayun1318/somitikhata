import { getTranslations } from "next-intl/server";

import { LoginForm } from "@/features/auth/components/login-form";
import { publicPageMetadata } from "@/lib/metadata";

export const generateMetadata = publicPageMetadata("login", "/login", async (locale) =>
  (await getTranslations({ locale, namespace: "Auth" }))("loginSubtitle"),
);

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Auth" });

  return (
    <>
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
