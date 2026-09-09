"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Building2, MapPin, ShieldCheck, ArrowUpRight } from "lucide-react";

export function Footer() {
  const t = useTranslations("Footer");
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-app-border bg-app-surface text-app-text">
      {/* Main Container */}
      <div className="mx-auto max-w-app-wide px-4 pt-10 pb-8 sm:px-6 sm:pt-14 sm:pb-12 lg:px-8">
        {/* Main Layout Grid */}
        <div className="flex flex-col gap-10 lg:grid lg:grid-cols-12 lg:gap-8">
          {/* 1. Branding & Organization Identity */}
          <div className="flex flex-col gap-4 lg:col-span-5">
            {/* Square Logo Box aligned with Title */}
            <div className="flex items-start gap-3.5 sm:items-center sm:gap-4">
              {/* Perfect Square Logo Box */}
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-app-border bg-white p-2 shadow-2xs transition-all duration-300 hover:border-app-primary/30 hover:shadow-xs">
                <Image
                  src="/branding/logo-mark-removebg-preview.png"
                  alt={t("orgName")}
                  fill
                  sizes="64px"
                  className="object-contain p-1"
                  priority={false}
                />
              </div>

              {/* Organization Text & Badges Stack */}
              <div className="flex flex-col justify-center gap-1">
                <h3 className="text-sm font-bold leading-snug tracking-tight text-app-text sm:text-base">
                  {t("orgName")}
                </h3>

                <div className="flex flex-wrap items-center gap-2 text-xs text-app-text-muted">
                  <span className="inline-flex items-center gap-1 font-medium">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-app-primary" />
                    {t("orgLocation")}
                  </span>
                  <span className="hidden text-app-border sm:inline">•</span>
                  <span className="inline-flex items-center gap-1 rounded-md border border-app-primary/20 bg-app-primary/5 px-2 py-0.5 text-[11px] font-semibold text-app-primary">
                    <ShieldCheck className="h-3 w-3" />
                    {t("registrationNo")}
                  </span>
                </div>
              </div>
            </div>

            {/* Description / Tagline */}
            {/* <p className="max-w-xl text-xs leading-relaxed text-app-text-muted sm:text-sm">
              {t("tagline")}
            </p> */}
          </div>

          {/* 2. Navigation Links */}
          <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:col-span-4">
            {/* Quick Links */}
            <div className="flex flex-col gap-3">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-app-text-muted">
                {t("quickLinks")}
              </h4>
              <ul className="flex flex-col gap-1 text-xs sm:text-sm">
                <li>
                  <Link
                    href="/"
                    className="inline-flex min-h-10 w-full items-center text-app-text transition-all duration-200 hover:translate-x-0.5 hover:text-app-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-focus sm:min-h-0"
                  >
                    {t("home")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="inline-flex min-h-10 w-full items-center text-app-text transition-all duration-200 hover:translate-x-0.5 hover:text-app-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-focus sm:min-h-0"
                  >
                    {t("login")}
                  </Link>
                </li>
                {/* <li>
                  <Link
                    href="/register"
                    className="inline-flex min-h-10 w-full items-center text-app-text transition-all duration-200 hover:translate-x-0.5 hover:text-app-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-focus sm:min-h-0"
                  >
                    {t("register")}
                  </Link>
                </li> */}
              </ul>
            </div>

            {/* Portal Links */}
            <div className="flex flex-col gap-3">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-app-text-muted">
                {t("portal")}
              </h4>
              <ul className="flex flex-col gap-1 text-xs sm:text-sm">
                <li>
                  <Link
                    href="/member/dashboard"
                    className="group inline-flex min-h-10 w-full items-center gap-1 text-app-text transition-all duration-200 hover:translate-x-0.5 hover:text-app-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-focus sm:min-h-0"
                  >
                    <span>{t("memberDashboard")}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-app-text-muted transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-app-primary" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/dashboard"
                    className="group inline-flex min-h-10 w-full items-center gap-1 text-app-text transition-all duration-200 hover:translate-x-0.5 hover:text-app-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-focus sm:min-h-0"
                  >
                    <span>{t("adminDashboard")}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-app-text-muted transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-app-primary" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* 3. Address Section */}
          <div className="flex flex-col gap-3 lg:col-span-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-app-text-muted">
              {t("contact")}
            </h4>
            <div className="flex items-start gap-2.5 text-xs leading-relaxed text-app-text-muted sm:text-sm">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-app-border bg-app-surface-muted shadow-2xs">
                <Building2 className="h-4 w-4 text-app-primary" />
              </div>
              <span className="pt-0.5">{t("address")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright & Credit */}
      <div className="border-t border-app-border bg-app-surface-muted/50 px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-app-wide flex-col items-center justify-between gap-3 text-center text-xs text-app-text-muted sm:flex-row sm:text-left">
          <p className="order-2 sm:order-1">
            © {currentYear} {t("orgName")}. {t("rights")}
          </p>

          <p className="order-1 font-medium text-app-text sm:order-2">
            {t("developedBy")}{" "}
            <a
              href="https://humayun1.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-app-primary transition-colors hover:text-app-primary-hover hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-focus"
            >
              {t("developerName")}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
