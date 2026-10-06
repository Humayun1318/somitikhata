import { CollectionsOverview } from "@/features/collections/components/collections-overview";
import { pageTitleMetadata } from "@/lib/metadata";

export const generateMetadata = pageTitleMetadata("collections");

export default function AdminCollectionsPage() {
  return <CollectionsOverview />;
}
