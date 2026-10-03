import { Suspense } from "react";

import { ListLoading } from "@/components/shared/list-states";
import { LoansPage } from "@/features/loans/components/loans-page";

// Suspense is needed because the page reads the URL search params.
export default function AdminLoansPage() {
  return (
    <Suspense fallback={<ListLoading />}>
      <LoansPage />
    </Suspense>
  );
}
