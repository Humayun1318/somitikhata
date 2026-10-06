"use client";

import { useTranslations } from "next-intl";

import { BrandLogo } from "@/components/shared/brand-logo";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { Link } from "@/i18n/navigation";

import { ProfileMenu } from "./profile-menu";

export function Header() {
  const t = useTranslations();

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full shrink-0 items-center justify-between gap-3 border-b border-app-border bg-app-surface px-4 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center md:hidden">
        <Link href="/" className="rounded-lg outline-offset-4 focus-visible:outline-2 focus-visible:outline-app-focus">
          <BrandLogo
            shortName={t("HomePage.nav.shortName")}
            registration={t("HomePage.nav.registration")}
            legalName={t("HomePage.nav.legalName")}
            location={t("HomePage.nav.location")}
          />
        </Link>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
        <LanguageSwitcher />
        <ProfileMenu />
      </div>
    </header>
  );
}
