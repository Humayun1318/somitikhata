import { Suspense } from "react";

import { ListLoading } from "@/components/shared/list-states";
import { CashBookPage } from "@/features/collections/components/cash-book-page";

// Suspense is needed because the page reads the URL search params.
export default function AdminCashBookPage() {
  return (
    <Suspense fallback={<ListLoading />}>
      <CashBookPage />
    </Suspense>
  );
}
