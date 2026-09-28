import type { ReactNode } from "react";

import { AuthGate } from "@/features/auth/components/auth-gate";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";
import { DashboardSidebarConfig } from "@/features/dashboard/config/sidebar";
import { filterSidebarItemsByRole } from "@/features/dashboard/filter-sidebar-items";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const filteredItems = filterSidebarItemsByRole({
    items: DashboardSidebarConfig.items,
    userRole: "ADMIN",
  });

  return (
    <AuthGate>
      <DashboardShell
        userRole="ADMIN"
        filteredItems={filteredItems}
        // TODO: replace placeholders with the logged-in user (useMe)
        userName="Admin User"
        memberNumber="123456"
      >
        {children}
      </DashboardShell>
    </AuthGate>
  );
}
