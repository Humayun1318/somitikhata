import { Suspense } from "react";

import { ListLoading } from "@/components/shared/list-states";
import { LedgerHeadsPage } from "@/features/ledger-heads/components/ledger-heads-page";
import { pageTitleMetadata } from "@/lib/metadata";

export const generateMetadata = pageTitleMetadata("ledgerHeads");

// Suspense is needed because the page reads the URL search params.
export default function AdminLedgerHeadsPage() {
  return (
    <Suspense fallback={<ListLoading />}>
      <LedgerHeadsPage />
    </Suspense>
  );
}
