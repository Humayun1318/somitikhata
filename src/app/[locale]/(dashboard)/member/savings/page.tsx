import { Suspense } from "react";

import { ListLoading } from "@/components/shared/list-states";
import { MySavingsPage } from "@/features/member-area/components/my-savings-page";
import { pageTitleMetadata } from "@/lib/metadata";

export const generateMetadata = pageTitleMetadata("mySavings");

// Suspense is needed because the page reads the URL search params (?page=).
export default function MemberSavingsPage() {
  return (
    <Suspense fallback={<ListLoading />}>
      <MySavingsPage />
    </Suspense>
  );
}
