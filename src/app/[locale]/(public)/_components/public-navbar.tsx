"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { BrandLogo } from "@/components/branding/brand-logo";

type PublicNavbarProps = {
  locale: string;
  howItWorksLabel: string;
  featuresLabel: string;
  faqLabel: string;
  languageLabel: string;
  loginLabel: string;
  navigationLabel: string;
  mobileNavigationLabel: string;
  openMenuLabel: string;
  closeMenuLabel: string;
  shortName: string;
  registration: string;
  legalName: string;
  location: string;
};

export function PublicNavbar({
  locale,
  howItWorksLabel,
  featuresLabel,
  faqLabel,
  languageLabel,
  loginLabel,
  navigationLabel,
  mobileNavigationLabel,
  openMenuLabel,
  closeMenuLabel,
  shortName,
  registration,
  legalName,
  location,
}: PublicNavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const nextLocale = locale === "en" ? "bn" : "en";
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-app-border bg-app-background/95 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex min-h-16 max-w-app-wide items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8 ">
        <Link
          href="/"
          onClick={closeMenu}
          aria-label="বটতলী সমবায় home"
          className="rounded-lg outline-offset-4 focus-visible:outline-2 focus-visible:outline-app-focus "
        >
          <BrandLogo
          className=""
            imageClassName=""
            shortName={shortName}
            registration={registration}
            legalName={legalName}
            location={location}
          />
        </Link>

        <nav
          aria-label={navigationLabel}
          className="hidden items-center gap-6 text-sm font-medium text-app-text-muted md:flex"
        >
          <Link
            href="#how-it-works"
            className="rounded-md px-1 py-1 transition hover:text-app-primary focus-visible:outline-2 focus-visible:outline-app-focus"
          >
            {howItWorksLabel}
          </Link>
          <Link
            href="#features"
            className="rounded-md px-1 py-1 transition hover:text-app-primary focus-visible:outline-2 focus-visible:outline-app-focus"
          >
            {featuresLabel}
          </Link>
          <Link
            href="#faq"
            className="rounded-md px-1 py-1 transition hover:text-app-primary focus-visible:outline-2 focus-visible:outline-app-focus"
          >
            {faqLabel}
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            locale={nextLocale}
            href="/"
            onClick={closeMenu}
            className="rounded-full border border-app-border bg-app-surface px-2.5 py-1.5 text-xs font-semibold text-app-text-muted transition hover:border-app-primary hover:text-app-primary focus-visible:outline-2 focus-visible:outline-app-focus sm:px-3"
          >
            {languageLabel}
          </Link>
          <Link
            href="/login"
            onClick={closeMenu}
            className="hidden rounded-xl bg-app-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-app-primary-hover focus-visible:outline-2 focus-visible:outline-app-focus sm:inline-flex"
          >
            {loginLabel}
          </Link>
          <button
            type="button"
            aria-expanded={isMenuOpen}
            aria-controls="public-mobile-navigation"
            aria-label={isMenuOpen ? closeMenuLabel : openMenuLabel}
            onClick={() => setIsMenuOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-app-border bg-app-surface text-app-text transition hover:border-app-primary hover:text-app-primary focus-visible:outline-2 focus-visible:outline-app-focus md:hidden"
          >
            {isMenuOpen ? (
              <X aria-hidden="true" size={20} />
            ) : (
              <Menu aria-hidden="true" size={20} />
            )}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <nav
          id="public-mobile-navigation"
          aria-label={mobileNavigationLabel}
          className="border-t border-app-border bg-app-surface px-4 py-3 md:hidden"
        >
          <div className="mx-auto flex max-w-app-wide flex-col gap-1 sm:px-2">
            <Link
              href="#how-it-works"
              onClick={closeMenu}
              className="rounded-lg px-3 py-3 text-sm font-medium text-app-text transition hover:bg-app-surface-muted hover:text-app-primary"
            >
              {howItWorksLabel}
            </Link>
            <Link
              href="#features"
              onClick={closeMenu}
              className="rounded-lg px-3 py-3 text-sm font-medium text-app-text transition hover:bg-app-surface-muted hover:text-app-primary"
            >
              {featuresLabel}
            </Link>
            <Link
              href="#faq"
              onClick={closeMenu}
              className="rounded-lg px-3 py-3 text-sm font-medium text-app-text transition hover:bg-app-surface-muted hover:text-app-primary"
            >
              {faqLabel}
            </Link>
            <Link
              href="/login"
              onClick={closeMenu}
              className="mt-2 rounded-xl bg-app-primary px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-app-primary-hover"
            >
              {loginLabel}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}

export type { PublicNavbarProps };
