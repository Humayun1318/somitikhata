import { SettingsPage } from "@/features/settings/components/settings-page";
import { pageTitleMetadata } from "@/lib/metadata";

export const generateMetadata = pageTitleMetadata("settings");

export default function AdminSettingsPage() {
  return <SettingsPage />;
}
