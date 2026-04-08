import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getCurrentProfile, getWorkspaceSettings } from "@/lib/data/queries";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [profile, settings] = await Promise.all([getCurrentProfile(), getWorkspaceSettings()]);

  return <AppShell profile={profile} workspaceName={settings?.workspace_name ?? "Northstar PM"}>{children}</AppShell>;
}
