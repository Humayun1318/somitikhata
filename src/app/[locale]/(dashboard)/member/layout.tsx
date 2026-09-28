import type { ReactNode } from "react";

import { AuthGate } from "@/features/auth/components/auth-gate";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";
import { DashboardSidebarConfig } from "@/features/dashboard/config/sidebar";
import { filterSidebarItemsByRole } from "@/features/dashboard/filter-sidebar-items";

export default function MemberLayout({ children }: { children: ReactNode }) {
  const filteredItems = filterSidebarItemsByRole({
    items: DashboardSidebarConfig.items,
    userRole: "MEMBER",
  });

  return (
    <AuthGate>
      <DashboardShell
        userRole="MEMBER"
        filteredItems={filteredItems}
        // TODO: replace placeholders with the logged-in user (useMe)
        userName="Member User"
        memberNumber="654321"
      >
        {children}
      </DashboardShell>
    </AuthGate>
  );
}
