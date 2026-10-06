import { UnavailablePage } from "@/features/member-area/components/unavailable-page";
import { pageTitleMetadata } from "@/lib/metadata";

export const generateMetadata = pageTitleMetadata("pendingMembers");

// Not supported by the backend yet: a finished "coming soon" notice, no sample data.
export default function AdminPendingMembersPage() {
  return <UnavailablePage name="pendingMembers" />;
}
