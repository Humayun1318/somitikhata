'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/utils/cn';
import { Permission, UserRole } from '@/types/dashboard-sidbar';
import { filterSidebarItemsByRole } from '@/utils/dashboard-sidebar-filter';
import { DynamicIcon } from '@/components/shared/dynamic-icon';
import { DashboardSidebarConfig } from '@/config/dashboard-sidebar';

type NavigationProps = {
  userRole: UserRole;
  userPermissions?: Permission[];
};

export function Sidebar({ userRole, userPermissions }: NavigationProps) {
  const t = useTranslations();
  const pathname = usePathname();

  const filteredNavItems = useMemo(
    () =>
      filterSidebarItemsByRole({
        items: DashboardSidebarConfig.items,
        userRole,
        userPermissions,
      }),
    [userRole, userPermissions]
  );

  // মোবাইলের বটম বারের জন্য প্রথম ৪-৫টি প্রাইমারি আইটেম
  const primaryMobileItems = useMemo(
    () => filteredNavItems.slice(0, 5),
    [filteredNavItems]
  );

  return (
    <>
      {/* ========================================================= */}
      {/* DESKTOP SIDEBAR (Visible on md screens and above)         */}
      {/* ========================================================= */}
      <aside className="hidden md:flex h-screen w-64 flex-col border-r border-app-border bg-app-surface px-4 py-6">
        {/* Top Branding Section (Icon + Name) */}
        <div className="mb-6 flex items-center gap-3 px-2">
          <Image
            src="/branding/icon-192.png"
            alt="Somitikhata Logo"
            width={36}
            height={36}
            className="h-9 w-9 object-contain"
            priority
          />
          <div className="flex flex-col">
            <span className="text-base font-bold leading-tight text-app-text">
              সমিতি খাতা
            </span>
            <span className="text-xs text-app-text-muted">cooperative app</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto" aria-label="Main Navigation">
          {filteredNavItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <div key={item.id}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-app-primary text-white'
                      : 'text-app-text hover:bg-app-surface-muted hover:text-app-primary'
                  )}
                >
                  <DynamicIcon name={item.iconName} className="h-5 w-5 shrink-0" />
                  <span>{t(item.titleKey)}</span>
                </Link>

                {/* Sub-menu rendering */}
                {item.children && item.children.length > 0 && (
                  <div className="ml-6 mt-1 space-y-1 border-l border-app-border pl-3">
                    {item.children.map((child) => {
                      const isChildActive = pathname === child.href;
                      return (
                        <Link
                          key={child.id}
                          href={child.href}
                          className={cn(
                            'block rounded-md px-3 py-2 text-xs font-medium transition-colors',
                            isChildActive
                              ? 'bg-app-primary/10 font-semibold text-app-primary'
                              : 'text-app-text-muted hover:text-app-text'
                          )}
                        >
                          {t(child.titleKey)}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* ========================================================= */}
      {/* MOBILE BOTTOM NAVIGATION BAR (Visible on small screens)   */}
      {/* ========================================================= */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-app-border bg-app-surface px-2 shadow-lg md:hidden"
        aria-label="Mobile Navigation"
      >
        {primaryMobileItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center py-1 text-xs font-medium transition-colors',
                isActive
                  ? 'text-app-primary font-semibold'
                  : 'text-app-text-muted hover:text-app-text'
              )}
            >
              <DynamicIcon name={item.iconName} className="h-5 w-5" />
              <span className="mt-1 truncate text-[10px]">{t(item.titleKey)}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}