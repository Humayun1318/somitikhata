"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/utils/cn";
import { DynamicIcon } from "@/components/shared/dynamic-icon";
import type { UserRole } from "@/types/dashboard-sidbar";

type MobileBottomNavProps = {
  userRole: UserRole;
  onOpenMore: () => void;
};

export function MobileBottomNav({
  userRole,
  onOpenMore,
}: MobileBottomNavProps) {
  const t = useTranslations();
  const pathname = usePathname();

  // ১. ড্যাশবোর্ড ইউআরএল
  const dashboardHref =
    userRole === "ADMIN" ? "/admin/dashboard" : "/member/dashboard";

  // ২. রোল অনুযায়ী মিডল অপশন (Member -> Savings, Admin -> Collections)
  const middleNavItem =
    userRole === "ADMIN"
      ? {
          href: "/admin/collections",
          titleKey: "DashboardSidebar.collections",
          iconName: "Receipt",
        }
      : {
          href: "/member/savings",
          titleKey: "DashboardSidebar.savings",
          iconName: "PiggyBank",
        };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-app-border bg-app-surface px-4 shadow-lg md:hidden">
      {/* 1. Dashboard (Left) */}
      <Link
        href={dashboardHref}
        className={cn(
          "flex flex-1 flex-col items-center justify-center py-1 text-xs font-medium transition-colors",
          pathname === dashboardHref
            ? "text-app-primary font-semibold"
            : "text-app-text-muted hover:text-app-text",
        )}
      >
        <DynamicIcon name="LayoutDashboard" className="h-5 w-5" />
        <span className="mt-1 text-[10px]">
          {t("DashboardSidebar.dashboard")}
        </span>
      </Link>

      {/* 2. Middle Action (Savings / Collections) */}
      <Link
        href={middleNavItem.href}
        className={cn(
          "flex flex-1 flex-col items-center justify-center py-1 text-xs font-medium transition-colors",
          pathname === middleNavItem.href ||
            pathname.startsWith(`${middleNavItem.href}/`)
            ? "text-app-primary font-semibold"
            : "text-app-text-muted hover:text-app-text",
        )}
      >
        <DynamicIcon name={middleNavItem.iconName} className="h-5 w-5" />
        <span className="mt-1 text-[10px]">{t(middleNavItem.titleKey)}</span>
      </Link>

      {/* 3. More (Right - Hamburger Drawer Opener) */}
      <button
        onClick={onOpenMore}
        type="button"
        className="flex flex-1 flex-col items-center justify-center py-1 text-xs font-medium text-app-text-muted transition-colors hover:text-app-text"
      >
        <DynamicIcon name="Menu" className="h-5 w-5" />
        <span className="mt-1 text-[10px]">মোড় (More)</span>
      </button>
    </nav>
  );
}
