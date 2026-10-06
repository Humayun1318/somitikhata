import { OpeningPage } from "@/features/collections/components/opening-page";
import { pageTitleMetadata } from "@/lib/metadata";

export const generateMetadata = pageTitleMetadata("openingBalances");

export default function AdminOpeningPage() {
  return <OpeningPage />;
}
