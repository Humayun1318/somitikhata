import { MyLoansPage } from "@/features/member-area/components/my-loans-page";
import { pageTitleMetadata } from "@/lib/metadata";

export const generateMetadata = pageTitleMetadata("myLoans");

export default function MemberLoansPage() {
  return <MyLoansPage />;
}
