import { MemberDashboardPage } from "@/features/member-area/components/member-dashboard-page";
import { pageTitleMetadata } from "@/lib/metadata";

export const generateMetadata = pageTitleMetadata("dashboard");

export default function MemberDashboardRoute() {
  return <MemberDashboardPage />;
}
