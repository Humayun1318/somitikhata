import { Suspense } from "react";

import { ListLoading } from "@/components/shared/list-states";
import { AdminOverviewPage } from "@/features/overview/components/admin-overview-page";
import { pageTitleMetadata } from "@/lib/metadata";

export const generateMetadata = pageTitleMetadata("dashboard");

// Suspense is needed because the page reads the URL search params (?year=).
export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<ListLoading />}>
      <AdminOverviewPage />
    </Suspense>
  );
}
