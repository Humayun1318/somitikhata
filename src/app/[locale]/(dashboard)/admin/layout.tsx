import type { ReactNode } from "react";

import { AuthGate } from "@/features/auth/components/auth-gate";
import { DashboardShell } from "@/features/dashboard/components/dashboard-shell";
import { DashboardSidebarConfig } from "@/features/dashboard/config/sidebar";
import { filterSidebarItemsByRole } from "@/features/dashboard/filter-sidebar-items";

// Server layout: it cannot read the session (cookies belong to the backend origin).
// Pages under this layout are gated by AuthGate. For the current user in a
// client component call useMe(), which reads GET /user/me from the query cache.
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
        // Placeholders. The real user comes from useMe() (features/auth/hooks/use-me).
        userName="Admin User"
        memberNumber="123456"
      >
        {children}
      </DashboardShell>
    </AuthGate>
  );
}
