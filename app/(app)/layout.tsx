import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getCurrentProfile, getProjects, getTasks, getWorkspaceSettings } from "@/lib/data/queries";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [profile, settings, projects, tasks] = await Promise.all([getCurrentProfile(), getWorkspaceSettings(), getProjects(), getTasks()]);

  if (!profile || profile.deleted_at || profile.status === "Inactive") {
    redirect("/login?error=Your account no longer has access to the workspace.");
  }

  return (
    <AppShell profile={profile} workspaceName={settings?.workspace_name ?? "Northstar PM"} projects={projects} tasks={tasks}>
      {children}
    </AppShell>
  );
}
