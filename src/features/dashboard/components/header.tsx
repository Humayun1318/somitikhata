"use client";

import { useTranslations } from "next-intl";

import { BrandLogo } from "@/components/shared/brand-logo";
import { LanguageSwitcher } from "@/components/shared/language-switcher";

import { ProfileMenu } from "./profile-menu";

export function Header() {
  const t = useTranslations();

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between gap-3 border-b border-app-border bg-app-surface px-4 sm:px-6">
      <div className="flex min-w-0 items-center md:hidden">
        <BrandLogo
          shortName={t("HomePage.nav.shortName")}
          registration={t("HomePage.nav.registration")}
          legalName={t("HomePage.nav.legalName")}
          location={t("HomePage.nav.location")}
        />
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
        <LanguageSwitcher />
        <ProfileMenu />
      </div>
    </header>
  );
}
