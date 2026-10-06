"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";

import { BrandLogo } from "@/components/shared/brand-logo";
import { AccountNav } from "@/features/auth/components/account-nav";
import { Link, usePathname } from "@/i18n/navigation";

// Sections of the home page. From another page (login, register) the links go
// to the home page first, then to the section.
const SECTIONS = [
  { id: "modules", key: "modules" },
  { id: "year", key: "year" },
  { id: "faq", key: "faq" },
] as const;

const LINK_CLASS =
  "rounded-md px-1 py-1 text-sm font-medium text-app-text-muted transition-colors hover:text-app-primary focus-visible:outline-2 focus-visible:outline-app-focus";

// Top bar of the public pages (home, login, register).
export function PublicNavbar() {
  const t = useTranslations("HomePage.nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const nextLocale = locale === "en" ? "bn" : "en";
  const isHome = pathname === "/";
  const sectionHref = (id: string) => (isHome ? `#${id}` : `/${locale}#${id}`);
  const closeMenu = () => setIsMenuOpen(false);
  const toggleMenu = () => setIsMenuOpen((open) => !open);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-app-border/80 bg-app-background/90 backdrop-blur-md print:hidden">
      <div className="mx-auto flex h-16 max-w-app-wide items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          onClick={closeMenu}
          aria-label={t("homeLabel")}
          className="min-w-0 rounded-lg outline-offset-4 focus-visible:outline-2 focus-visible:outline-app-focus"
        >
          <BrandLogo
            shortName={t("shortName")}
            registration={t("registration")}
            legalName={t("legalName")}
            location={t("location")}
          />
        </Link>

        <nav aria-label={t("navigationLabel")} className="hidden items-center gap-7 md:flex">
          {SECTIONS.map((section) => (
            <a key={section.id} href={sectionHref(section.id)} className={LINK_CLASS}>
              {t(section.key)}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href={pathname}
            locale={nextLocale}
            onClick={closeMenu}
            title={t("languageLabel")}
            aria-label={t("languageLabel")}
            className="flex h-9 min-w-9 items-center justify-center rounded-full border border-app-border bg-app-surface px-2 text-xs font-bold text-app-text transition-colors hover:border-app-primary hover:text-app-primary focus-visible:outline-2 focus-visible:outline-app-focus"
          >
            {t("language")}
          </Link>

          <AccountNav placement="bar" loginLabel={t("login")} />

          <button
            type="button"
            aria-expanded={isMenuOpen}
            aria-controls="public-mobile-navigation"
            aria-label={isMenuOpen ? t("closeMenuLabel") : t("openMenuLabel")}
            onClick={toggleMenu}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-app-border bg-app-surface text-app-text transition-colors hover:border-app-primary hover:text-app-primary focus-visible:outline-2 focus-visible:outline-app-focus md:hidden"
          >
            {isMenuOpen ? <X aria-hidden="true" className="h-5 w-5" /> : <Menu aria-hidden="true" className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <nav
          id="public-mobile-navigation"
          aria-label={t("mobileNavigationLabel")}
          className="border-t border-app-border bg-app-surface px-4 py-3 md:hidden"
        >
          <div className="flex flex-col gap-1">
            {SECTIONS.map((section) => (
              <a
                key={section.id}
                href={sectionHref(section.id)}
                onClick={closeMenu}
                className="rounded-lg px-3 py-3 text-sm font-medium text-app-text transition-colors hover:bg-app-surface-muted hover:text-app-primary"
              >
                {t(section.key)}
              </a>
            ))}
            <AccountNav placement="menu" loginLabel={t("login")} onNavigate={closeMenu} />
          </div>
        </nav>
      )}
    </header>
  );
}
