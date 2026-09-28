
"use client";

import { Link } from "@/i18n/navigation";
import { DynamicIcon } from "@/components/shared/dynamic-icon";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { BrandLogo } from "@/components/shared/brand-logo";
import { useTranslations } from "next-intl";

type HeaderProps = {
  userName?: string;
  memberNumber?: string;
  userRole?: string; 
};

export function Header({
  userName = "User",
  memberNumber,
  userRole = "MEMBER",
}: HeaderProps) {
  const t = useTranslations();
  const profileHref = userRole === 'ADMIN' ? '/admin/profile' : '/member/profile';

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-app-border bg-app-surface px-4 sm:px-6">
      <div className="flex items-center gap-3 md:hidden">
        <BrandLogo
          shortName={t("HomePage.nav.shortName")}
          registration={t("HomePage.nav.registration")}
          legalName={t("HomePage.nav.legalName")}
          location={t("HomePage.nav.location")}
        />
      </div>

      <div className="hidden md:flex items-center gap-3 rounded-lg border border-app-border bg-app-surface-muted px-3.5 py-1.5">
        <div className="flex flex-col">
          <span className="text-sm font-semibold leading-tight text-app-text">
            {userName}
          </span>
          {memberNumber && (
            <span className="text-xs text-app-text-muted">
              আইডি: <span className="font-mono font-medium">{memberNumber}</span>
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3.5">
        <LanguageSwitcher />

        <Link
          href={profileHref}
          className="flex items-center justify-center rounded-full p-1 transition-colors hover:bg-app-surface-muted"
          aria-label="Profile"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-app-primary/10 text-app-primary">
            <DynamicIcon name="User" className="h-5 w-5" />
          </div>
        </Link>
      </div>
    </header>
  );
}