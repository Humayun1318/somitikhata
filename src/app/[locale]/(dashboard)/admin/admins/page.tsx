import { Suspense } from "react";

import { ListLoading } from "@/components/shared/list-states";
import { AdminsPage } from "@/features/admins/components/admins-page";
import { pageTitleMetadata } from "@/lib/metadata";

export const generateMetadata = pageTitleMetadata("admins");

// Suspense is needed because the page reads the URL search params.
export default function AdminAdminsPage() {
  return (
    <Suspense fallback={<ListLoading />}>
      <AdminsPage />
    </Suspense>
  );
}
