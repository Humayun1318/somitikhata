
"use client";

import { Link } from "@/i18n/navigation";
import { DynamicIcon } from "@/components/shared/dynamic-icon";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { BrandLogo } from "@/components/branding/brand-logo";
import { useTranslations } from "next-intl";

type HeaderProps = {
  userName?: string;
  memberNumber?: string;
  userRole?: "ADMIN" | "MEMBER"; // Add userRole prop
};

export function Header({
  userName = "User",
  memberNumber,
  userRole = "MEMBER", // Default to MEMBER if not provided
}: HeaderProps) {
  const t = useTranslations();
  const profileHref = userRole === 'ADMIN' ? '/admin/profile' : '/member/profile';

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-app-border bg-app-surface px-4 sm:px-6">
      {/* 1. Left Mobile Branding (Desktop branding is inside Desktop Sidebar) */}
      <div className="flex items-center gap-3 md:hidden">
        <BrandLogo
          shortName={t("HomePage.nav.shortName")}
          registration={t("HomePage.nav.registration")}
          legalName={t("HomePage.nav.legalName")}
          location={t("HomePage.nav.location")}
        />
      </div>

      {/* 2. Desktop Profile Info Card (Searchbar এর স্থানে শুধুমাত্র ডেস্কটপে দেখাবে) */}
      <div className="hidden md:flex items-center gap-3 rounded-lg border border-app-border bg-app-surface-muted px-3.5 py-1.5">
        {/* <div className="flex h-8 w-8 items-center justify-center rounded-full bg-app-primary/10 text-app-primary">
          <DynamicIcon name="User" className="h-4 w-4" />
        </div> */}
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

      {/* 3. Right Controls: Language Switcher & Profile Avatar */}
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