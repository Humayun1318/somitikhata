import { Suspense } from "react";

import { MembersLoading } from "@/features/members/components/members-list-states";
import { MembersPage } from "@/features/members/components/members-page";
import { pageTitleMetadata } from "@/lib/metadata";

export const generateMetadata = pageTitleMetadata("members");

// Suspense is needed because the page reads the URL search params.
export default function AdminMembersPage() {
  return (
    <Suspense fallback={<MembersLoading />}>
      <MembersPage />
    </Suspense>
  );
}
