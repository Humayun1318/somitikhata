import { Suspense } from "react";

import { ListLoading } from "@/components/shared/list-states";
import { PassbookPage } from "@/features/collections/components/passbook-page";

// Suspense is needed because the page reads the URL search params.
export default function AdminPassbookPage() {
  return (
    <Suspense fallback={<ListLoading />}>
      <PassbookPage />
    </Suspense>
  );
}
