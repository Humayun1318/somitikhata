import { Suspense } from "react";

import { ListLoading } from "@/components/shared/list-states";
import { YearEndPage } from "@/features/year-end/components/year-end-page";
import { pageTitleMetadata } from "@/lib/metadata";

export const generateMetadata = pageTitleMetadata("yearEnd");

// Suspense is needed because the page reads the URL search params (?year=).
export default function AdminYearEndPage() {
  return (
    <Suspense fallback={<ListLoading />}>
      <YearEndPage />
    </Suspense>
  );
}
