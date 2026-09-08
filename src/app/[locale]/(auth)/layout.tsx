import type { ReactNode } from "react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageContainer } from "@/components/shared/page-container";
import { PublicNavbar } from "../(public)/_components/public-navbar";
import { Footer } from "../(public)/_components/footer";

type AuthLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AuthLayout({
  children,
  params,
}: AuthLayoutProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Auth" });
  const tnav = await getTranslations({ locale, namespace: "HomePage" });

  return (
    <main className="min-h-screen bg-app-background">
      {/* Render the public navbar (home page top) with translated labels and other props */}
      <PublicNavbar
        locale={locale}
        howItWorksLabel={tnav("nav.howItWorks")}
        featuresLabel={tnav("nav.features")}
        faqLabel={tnav("nav.faq")}
        languageLabel={tnav("nav.language")}
        loginLabel={tnav("nav.login")}
        navigationLabel={tnav("nav.navigationLabel")}
        mobileNavigationLabel={tnav("nav.mobileNavigationLabel")}
        openMenuLabel={tnav("nav.openMenuLabel")}
        closeMenuLabel={tnav("nav.closeMenuLabel")}
        shortName={tnav("nav.shortName")}
        registration={tnav("nav.registration")}
        legalName={tnav("nav.legalName")}
        location={tnav("nav.location")}
      />
      <PageContainer size="content" className="py-6 sm:py-10 mt-16">
        <div className="mx-auto w-full max-w-md rounded-2xl border border-app-border bg-app-surface p-6 shadow-xs sm:p-8">
          <div className="text-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-app-focus"
            >
              <Image
                src="/branding/logo-mark-removebg-preview.png"
                alt={t("metaTitleSuffix")}
                width={64}
                height={64}
                className="h-24 w-24 object-contain"
                priority
              />
            </Link>
          </div>
          {children}
        </div>
      </PageContainer>
      <Footer />
    </main>
  );
}
