import type { ReactNode } from "react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PageContainer } from "@/components/shared/page-container";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { Footer } from "@/components/layout/footer";

type AuthLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AuthLayout({ children, params }: AuthLayoutProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Auth" });

  return (
    <div className="min-h-screen bg-app-background">
      <PublicNavbar />
      <main>
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
                  width={96}
                  height={96}
                  className="h-24 w-24 object-contain"
                  priority
                />
              </Link>
            </div>
            {children}
          </div>
        </PageContainer>
      </main>
      <Footer />
    </div>
  );
}
