"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/utils/cn";
import { DynamicIcon } from "@/components/shared/dynamic-icon";
import { DashboardSidebarItem } from "@/types/dashboard-sidbar";
import { BrandLogo } from "@/components/branding/brand-logo";

export function DesktopSidebar({ items }: { items: DashboardSidebarItem[] }) {
  const t = useTranslations();
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex h-screen w-64 flex-col border-r border-app-border bg-app-surface px-4 py-6">
      {/* Branding */}
      <BrandLogo
        shortName={t("HomePage.nav.shortName")}
        registration={t("HomePage.nav.registration")}
        legalName={t("HomePage.nav.legalName")}
        location={t("HomePage.nav.location")}
      />

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto mt-4">
        {items.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <div key={item.id}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-app-primary text-white"
                    : "text-app-text hover:bg-app-surface-muted hover:text-app-primary",
                )}
              >
                <DynamicIcon
                  name={item.iconName}
                  className="h-5 w-5 shrink-0"
                />
                <span>{t(item.titleKey)}</span>
              </Link>

              {/* Sub-menu / Children Rendering */}
              {item.children && item.children.length > 0 && (
                <div className="ml-6 mt-1 space-y-1 border-l border-app-border pl-3">
                  {item.children.map((child) => {
                    const isChildActive = pathname === child.href;
                    return (
                      <Link
                        key={child.id}
                        href={child.href}
                        className={cn(
                          "block rounded-md px-3 py-2 text-xs font-medium transition-colors",
                          isChildActive
                            ? "bg-app-primary/10 font-semibold text-app-primary"
                            : "text-app-text-muted hover:text-app-text",
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
  );
}
