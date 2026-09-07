import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Building2, MapPin, ShieldCheck, ArrowUpRight } from 'lucide-react';

export function Footer() {
  const t = useTranslations('Footer');
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-app-border bg-app-surface text-app-text transition-colors duration-200">
      {/* Container: Mobile First Padding & Custom Max Width */}
      <div className="mx-auto max-w-app-wide px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        
        {/* Responsive Layout: Stacks on mobile, Grid on large screens */}
        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-12 lg:gap-8">
          
          {/* 1. Organization & Logo Info */}
          <div className="flex flex-col gap-4 lg:col-span-5">
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              {/* Photo Card Container */}
              <div className="relative h-20 w-36 shrink-0 overflow-hidden rounded-xl border border-app-border bg-white p-2 shadow-sm">
                <Image
                  src="/images/logo-horizontal.png"
                  alt={t('orgName')}
                  fill
                  sizes="(max-width: 640px) 144px, 144px"
                  className="object-contain"
                  priority={false}
                />
              </div>

              <div className="flex flex-col gap-1">
                <h3 className="text-base font-bold leading-tight text-app-text">
                  {t('orgName')}
                </h3>
                <p className="flex items-center gap-1.5 text-xs font-medium text-app-text-muted">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-app-primary" />
                  {t('orgLocation')}
                </p>
                <div className="mt-1 inline-flex items-center gap-1.5 self-start rounded-md border border-app-border bg-app-surface-muted px-2.5 py-1 text-[11px] font-semibold text-app-primary">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>{t('registrationNo')}</span>
                </div>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-app-text-muted sm:text-sm">
              {t('tagline')}
            </p>
          </div>

          {/* 2. Navigation Links (2 Columns side-by-side on mobile for better space) */}
          <div className="grid grid-cols-2 gap-6 lg:col-span-4">
            {/* Quick Links */}
            <div className="flex flex-col gap-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-app-text-muted">
                {t('quickLinks')}
              </h4>
              <ul className="flex flex-col gap-2 text-sm">
                <li>
                  <Link
                    href="/"
                    className="inline-flex min-h-[44px] items-center text-app-text transition-colors hover:text-app-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-focus sm:min-h-0"
                  >
                    {t('home')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="inline-flex min-h-[44px] items-center text-app-text transition-colors hover:text-app-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-focus sm:min-h-0"
                  >
                    {t('login')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="inline-flex min-h-[44px] items-center text-app-text transition-colors hover:text-app-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-focus sm:min-h-0"
                  >
                    {t('register')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Portal Links */}
            <div className="flex flex-col gap-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-app-text-muted">
                {t('portal')}
              </h4>
              <ul className="flex flex-col gap-2 text-sm">
                <li>
                  <Link
                    href="/member/dashboard"
                    className="inline-flex min-h-[44px] items-center gap-1 text-app-text transition-colors hover:text-app-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-focus sm:min-h-0"
                  >
                    {t('memberDashboard')}
                    <ArrowUpRight className="h-3.5 w-3.5 text-app-text-muted" />
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin/dashboard"
                    className="inline-flex min-h-[44px] items-center gap-1 text-app-text transition-colors hover:text-app-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-focus sm:min-h-0"
                  >
                    {t('adminDashboard')}
                    <ArrowUpRight className="h-3.5 w-3.5 text-app-text-muted" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* 3. Contact & Location Section */}
          <div className="flex flex-col gap-2.5 lg:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-app-text-muted">
              {t('contact')}
            </h4>
            <div className="flex items-start gap-2 text-xs leading-relaxed text-app-text-muted sm:text-sm">
              <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-app-primary" />
              <span>{t('address')}</span>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Copyright & Developer Credit */}
      <div className="border-t border-app-border bg-app-surface-muted px-4 py-4 text-center sm:px-6">
        <div className="mx-auto flex max-w-app-wide flex-col items-center justify-between gap-2 text-xs text-app-text-muted sm:flex-row">
          <p>
            © {currentYear} {t('orgName')}. {t('rights')}
          </p>
          
          {/* Custom Developer Credit */}
          <p className="font-medium text-app-text">
            {t('developedBy')}{' '}
            <a
              href="https://yourwebsite.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-app-primary hover:underline hover:text-app-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-focus"
            >
              {t('developerName')}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}