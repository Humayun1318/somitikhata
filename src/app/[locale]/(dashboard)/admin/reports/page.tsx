import { Suspense } from "react";

import { ListLoading } from "@/components/shared/list-states";
import { ReportsPage } from "@/features/reports/components/reports-page";
import { pageTitleMetadata } from "@/lib/metadata";

export const generateMetadata = pageTitleMetadata("reports");

// Suspense is needed because the page reads the URL search params (?report=&year=).
export default function AdminReportsPage() {
  return (
    <Suspense fallback={<ListLoading />}>
      <ReportsPage />
    </Suspense>
  );
}
