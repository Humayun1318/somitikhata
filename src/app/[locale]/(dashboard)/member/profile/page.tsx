import { ProfileView } from "@/features/profile/components/profile-view";
import { pageTitleMetadata } from "@/lib/metadata";

export const generateMetadata = pageTitleMetadata("profile");

export default function MemberProfilePage() {
  return <ProfileView />;
}
