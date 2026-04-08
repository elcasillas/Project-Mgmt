import { PageHeader } from "@/components/shared/page-header";
import { SettingsPanels } from "@/components/settings/settings-panels";
import { getCurrentProfile, getWorkspaceSettings } from "@/lib/data/queries";

export default async function SettingsPage() {
  const [profile, settings] = await Promise.all([getCurrentProfile(), getWorkspaceSettings()]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Configuration"
        title="Settings"
        description="Manage profile details, workspace defaults, and notification behavior."
      />
      <SettingsPanels profile={profile} settings={settings} />
    </div>
  );
}
