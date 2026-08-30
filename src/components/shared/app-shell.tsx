'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { getLocaleFromPathname, switchLocalePath, type Locale } from '@/lib/i18n/locales';

const memberNav = [
  { href: '/member/dashboard', label: 'Dashboard' },
  { href: '/member/deposits', label: 'Deposits' },
  { href: '/member/loans', label: 'Loans' },
  { href: '/member/assets', label: 'Assets' },
  { href: '/member/profile', label: 'Profile' },
];

const adminNav = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/members', label: 'Members' },
  { href: '/admin/deposits', label: 'Deposits' },
  { href: '/admin/loans', label: 'Loans' },
  { href: '/admin/assets', label: 'Assets' },
  { href: '/admin/reports', label: 'Reports' },
  { href: '/admin/settings', label: 'Settings' },
];

export function AppShell({
  locale,
  variant,
  title,
  children,
  actions,
}: {
  locale?: Locale;
  variant: 'public' | 'member' | 'admin';
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const activeLocale = locale ?? getLocaleFromPathname(pathname);
  const navItems = variant === 'admin' ? adminNav : memberNav;

  const handleLocaleToggle = () => {
    const nextLocale = activeLocale === 'en' ? 'bn' : 'en';
    router.push(switchLocalePath(pathname, nextLocale));
  };

  if (variant === 'public') {
    return (
      <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
        <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[rgba(247,248,247,0.92)] backdrop-blur-sm">
          <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-4 md:px-6">
            <Link href={`/${activeLocale}`} className="flex items-center gap-3 text-lg font-bold text-[var(--color-primary)]">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)] text-sm text-white">SK</span>
              SomitiKhata
            </Link>
            <nav className="hidden items-center gap-6 text-sm font-medium text-[var(--color-text-muted)] md:flex">
              <Link href={`/${activeLocale}/#how-it-works`}>How it works</Link>
              <Link href={`/${activeLocale}/#features`}>Features</Link>
              <Link href={`/${activeLocale}/#faq`}>FAQ</Link>
            </nav>
            <div className="flex items-center gap-3">
              <button type="button" onClick={handleLocaleToggle} className="rounded-full border border-[var(--color-border)] bg-white px-2 py-1 text-xs font-medium text-[var(--color-text-muted)] transition hover:text-[var(--color-primary)]">
                {activeLocale === 'en' ? 'বাংলা' : 'EN'}
              </button>
              <Link href={`/${activeLocale}/login`} className="rounded-xl bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-hover)]">
                Login
              </Link>
            </div>
          </div>
        </header>
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text)]">
      <div className="mx-auto flex max-w-[1200px] gap-6 p-4 md:p-6">
        <aside className="hidden w-72 shrink-0 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.06)] lg:block">
          <div className="mb-8 flex items-center gap-3 px-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)] text-sm font-bold text-white">SK</span>
            <div>
              <div className="text-lg font-bold text-[var(--color-primary)]">SomitiKhata</div>
              <div className="text-xs text-[var(--color-text-muted)]">{variant === 'admin' ? 'Admin Console' : 'Member Portal'}</div>
            </div>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={`/${activeLocale}${item.href}`}
                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--color-text-muted)] transition hover:bg-[rgba(15,107,79,0.06)] hover:text-[var(--color-text)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1">
          <header className="mb-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.06)] md:p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--color-text-muted)]">{variant === 'admin' ? 'Admin' : 'Member'}</div>
                <h1 className="mt-1 text-2xl font-bold text-[var(--color-text)]">{title}</h1>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={handleLocaleToggle} className="rounded-full border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)] transition hover:text-[var(--color-primary)]">
                  {activeLocale === 'en' ? 'বাংলা' : 'EN'}
                </button>
                {actions}
              </div>
            </div>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
