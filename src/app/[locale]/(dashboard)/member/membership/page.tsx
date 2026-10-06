import { MembershipView } from "@/features/membership/components/membership-view";
import { pageTitleMetadata } from "@/lib/metadata";

export const generateMetadata = pageTitleMetadata("membership");

export default function MemberMembershipPage() {
  return <MembershipView />;
}
