import { Suspense } from "react";

import { ListLoading } from "@/components/shared/list-states";
import { AdminsPage } from "@/features/admins/components/admins-page";

// Suspense is needed because the page reads the URL search params.
export default function AdminAdminsPage() {
  return (
    <Suspense fallback={<ListLoading />}>
      <AdminsPage />
    </Suspense>
  );
}
