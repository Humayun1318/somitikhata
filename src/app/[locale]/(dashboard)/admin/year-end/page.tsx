import { Suspense } from "react";

import { ListLoading } from "@/components/shared/list-states";
import { YearEndPage } from "@/features/year-end/components/year-end-page";

// Suspense is needed because the page reads the URL search params (?year=).
export default function AdminYearEndPage() {
  return (
    <Suspense fallback={<ListLoading />}>
      <YearEndPage />
    </Suspense>
  );
}
