'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/utils/cn';
import { DynamicIcon } from '@/components/shared/dynamic-icon';
import { DashboardSidebarItem } from '@/types/dashboard-sidbar';
import { BrandLogo } from '@/components/branding/brand-logo';


type MobileDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  items: DashboardSidebarItem[];
};

export function MobileDrawer({ isOpen, onClose, items }: MobileDrawerProps) {
  const t = useTranslations();
  const pathname = usePathname();

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 md:hidden transition-all duration-300 pointer-events-none',
        isOpen && 'pointer-events-auto'
      )}
    >
      {/* 1. Backdrop Fade Animation */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 opacity-0 transition-opacity duration-300 ease-in-out',
          isOpen && 'opacity-100'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 2. Drawer Slide-in Animation & Responsive Width */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 flex w-[80vw] max-w-xs flex-col bg-app-surface p-5 shadow-2xl transition-transform duration-300 ease-in-out -translate-x-full',
          isOpen && 'translate-x-0'
        )}
      >
        <div className="mb-6 flex items-center justify-between border-b border-app-border pb-4">
          <span className="text-base font-bold text-app-text">
            <BrandLogo
              shortName={t("HomePage.nav.shortName")}
              registration={t("HomePage.nav.registration")}
              legalName={t("HomePage.nav.legalName")}
              location={t("HomePage.nav.location")}
            />
          </span>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-app-text-muted hover:bg-app-surface-muted hover:text-app-text transition-colors"
            aria-label="Close menu"
          >
            <DynamicIcon name="X" className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto">
          {items.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <div key={item.id}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-app-primary text-white"
                      : "text-app-text hover:bg-app-surface-muted"
                  )}
                >
                  <DynamicIcon name={item.iconName} className="h-5 w-5 shrink-0" />
                  <span>{t(item.titleKey)}</span>
                </Link>

                {/* Sub-menu inside Mobile Drawer */}
                {item.children && item.children.length > 0 && (
                  <div className="ml-6 mt-1 space-y-1 border-l border-app-border pl-3">
                    {item.children.map((child) => {
                      const isChildActive = pathname === child.href;
                      return (
                        <Link
                          key={child.id}
                          href={child.href}
                          onClick={onClose}
                          className={cn(
                            "block rounded-md px-3 py-2 text-xs font-medium transition-colors",
                            isChildActive
                              ? "bg-app-primary/10 font-semibold text-app-primary"
                              : "text-app-text-muted hover:text-app-text"
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
      </div>
    </div>
  );
}