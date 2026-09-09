import type { ReactNode } from "react";
import { DashboardSidebarConfig } from "@/config/dashboard-sidebar";
import { requireUser } from "@/lib/auth/session";
import { filterSidebarItemsByRole } from "@/utils/dashboard-sidebar-filter";
import { DashboardClientWrapper } from "../_components/dashboard-client-wrapper";

type AdminLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function AdminLayout({
  children,
  params,
}: AdminLayoutProps) {
  const { locale } = await params;
  //   const user = await requireUser(locale, 'admin');

  const filteredItems = filterSidebarItemsByRole({
    items: DashboardSidebarConfig.items,
    userRole: "ADMIN",
  });

  console.log("Filtered Sidebar Items for Admin:", filteredItems);

  return (
    <DashboardClientWrapper
      userRole="ADMIN"
      filteredItems={filteredItems}
      //   userName={user.name}
      userName="Admin User" // Placeholder name for admin user
      memberNumber="123456" // Placeholder member number for admin user
    >
      {children}
    </DashboardClientWrapper>
  );
}
