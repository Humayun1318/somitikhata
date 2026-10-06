"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ExternalLink, MapPin, ShieldCheck } from "lucide-react";

import { useMe } from "@/features/auth/hooks/use-me";
import { getPostLoginRoute } from "@/features/auth/role-routes";
import { Link } from "@/i18n/navigation";

const LINK_CLASS =
  "inline-flex min-h-10 items-center text-sm text-app-text transition-colors hover:text-app-primary focus-visible:outline-2 focus-visible:outline-app-focus sm:min-h-0";
const HEADING_CLASS = "text-sm font-semibold text-app-text-muted";

// Site footer for the public pages: who the samiti is, where to go next,
// the address, and who built the app.
export function Footer() {
  const t = useTranslations("Footer");
  const tNav = useTranslations("HomePage.nav");
  const locale = useLocale();
  const { data: user } = useMe();
  const year = new Date().getFullYear();

  const sections = [
    { id: "modules", label: tNav("modules") },
    { id: "year", label: tNav("year") },
    { id: "faq", label: tNav("faq") },
  ];

  return (
    <footer className="border-t border-app-border bg-app-surface text-app-text print:hidden">
      <div className="mx-auto grid max-w-app-wide gap-10 px-4 py-12 sm:px-6 sm:py-14 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-5">
          <div className="flex items-center gap-4">
            <Image
              src="/branding/logo-mark-removebg-preview.png"
              alt=""
              width={56}
              height={56}
              className="h-14 w-14 shrink-0 object-contain"
            />
            <div>
              <p className="text-base font-bold leading-snug">{t("orgName")}</p>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-app-text-muted">
                <span className="inline-flex items-center gap-1">
                  <MapPin aria-hidden="true" className="h-3.5 w-3.5 text-app-primary" />
                  {t("orgLocation")}
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-app-primary">
                  <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5" />
                  {t("registrationNo")}
                </span>
              </p>
            </div>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-app-text-muted">{t("tagline")}</p>
        </div>

        <nav aria-label={t("explore")} className="lg:col-span-2">
          <p className={HEADING_CLASS}>{t("explore")}</p>
          <ul className="mt-3 space-y-1 sm:space-y-2">
            {sections.map((section) => (
              <li key={section.id}>
                <a href={`/${locale}#${section.id}`} className={LINK_CLASS}>
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={t("account")} className="lg:col-span-2">
          <p className={HEADING_CLASS}>{t("account")}</p>
          <ul className="mt-3 space-y-1 sm:space-y-2">
            {user ? (
              <li>
                <Link href={getPostLoginRoute(user)} className={LINK_CLASS}>
                  {t("myDashboard")}
                </Link>
              </li>
            ) : (
              <>
                <li>
                  <Link href="/login" className={LINK_CLASS}>
                    {t("login")}
                  </Link>
                </li>
                <li>
                  <Link href="/register" className={LINK_CLASS}>
                    {t("join")}
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        <div className="lg:col-span-3">
          <p className={HEADING_CLASS}>{t("contact")}</p>
          <address className="mt-3 text-sm not-italic leading-relaxed text-app-text">{t("address")}</address>
        </div>
      </div>

      <div className="border-t border-app-border bg-app-surface-muted/60">
        <div className="mx-auto flex max-w-app-wide flex-col gap-2 px-4 py-4 text-xs text-app-text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            © {year} {t("orgName")} {t("rights")}
          </p>
          <p>
            {t("developedBy")}{" "}
            <a
              href="https://humayun1.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-app-primary hover:underline focus-visible:outline-2 focus-visible:outline-app-focus"
            >
              {t("developerName")}
              <ExternalLink aria-hidden="true" className="h-3 w-3" />
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
