import { Suspense } from "react";

import { ListLoading } from "@/components/shared/list-states";
import { SocietyPage } from "@/features/collections/components/society-page";
import { pageTitleMetadata } from "@/lib/metadata";

export const generateMetadata = pageTitleMetadata("societyEntries");

// Suspense is needed because the page reads the URL search params.
export default function AdminSocietyEntriesPage() {
  return (
    <Suspense fallback={<ListLoading />}>
      <SocietyPage />
    </Suspense>
  );
}
