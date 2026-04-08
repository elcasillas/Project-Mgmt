import { logoutAction } from "@/lib/actions/auth";
import { updateProfileAction, updateWorkspaceSettingsAction } from "@/lib/actions/workspace";
import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { Profile } from "@/lib/types/domain";

export function SettingsPanels({
  profile,
  settings
}: {
  profile: Profile | null;
  settings: {
    workspace_name: string;
    default_project_status: string;
    default_project_priority: string;
    notifications_enabled: boolean;
  } | null;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
      <Card>
        <h2 className="text-lg font-semibold text-slate-950">Profile</h2>
        <p className="mt-1 text-sm text-slate-500">Manage your workspace identity and avatar link.</p>
        <form action={updateProfileAction} className="mt-6 space-y-4">
          <FormField label="Full name">
            <Input name="full_name" defaultValue={profile?.full_name ?? ""} />
          </FormField>
          <FormField label="Email">
            <Input value={profile?.email ?? ""} readOnly disabled />
          </FormField>
          <FormField label="Avatar URL">
            <Input name="avatar_url" defaultValue={profile?.avatar_url ?? ""} placeholder="https://..." />
          </FormField>
          <div className="flex justify-between">
            <Button variant="ghost" formAction={logoutAction}>
              Log out
            </Button>
            <Button>Save profile</Button>
          </div>
        </form>
      </Card>
      <Card>
        <h2 className="text-lg font-semibold text-slate-950">Workspace settings</h2>
        <p className="mt-1 text-sm text-slate-500">Default delivery settings and notification preferences.</p>
        <form action={updateWorkspaceSettingsAction} className="mt-6 space-y-4">
          <FormField label="Workspace name">
            <Input name="workspace_name" defaultValue={settings?.workspace_name ?? "Northstar PM"} />
          </FormField>
          <FormField label="Default project status">
            <Select name="default_project_status" defaultValue={settings?.default_project_status ?? "Planning"}>
              <option>Planning</option>
              <option>Active</option>
              <option>On Hold</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </Select>
          </FormField>
          <FormField label="Default project priority">
            <Select name="default_project_priority" defaultValue={settings?.default_project_priority ?? "Medium"}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
              <option>Critical</option>
            </Select>
          </FormField>
          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <input
              type="checkbox"
              name="notifications_enabled"
              defaultChecked={settings?.notifications_enabled ?? true}
              className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
            />
            <span className="text-sm font-medium text-slate-700">Enable workspace notifications</span>
          </label>
          <div className="flex justify-end">
            <Button>Save workspace settings</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
