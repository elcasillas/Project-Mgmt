import { PageHeader } from "@/components/shared/page-header";
import { ProjectsView } from "@/components/projects/projects-view";
import { RealtimeRefresh } from "@/components/shared/realtime-refresh";
import { Card } from "@/components/ui/card";
import { getCurrentProfile, getProjects, getTeamMembers } from "@/lib/data/queries";

export default async function ProjectsPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const params = await searchParams;
  const [projects, teamMembers, currentProfile] = await Promise.all([getProjects(), getTeamMembers(), getCurrentProfile()]);
  const profiles = teamMembers.map(({ activeProjects, assignedTasks, workloadSummary, ...profile }) => profile);
  const canManageProjects = currentProfile?.role === "Admin" || currentProfile?.role === "Project Manager";

  return (
    <div className="space-y-8">
      <RealtimeRefresh tables={["projects", "project_members", "tasks"]} />
      <PageHeader
        eyebrow="Portfolio"
        title="Projects"
        description="Create, prioritize, and steer delivery work with clear ownership and progress visibility."
      />
      {params.error ? (
        <Card className="border-rose-200 bg-rose-50 text-rose-800">
          <p className="text-sm font-medium">{params.error}</p>
        </Card>
      ) : null}
      {params.success ? (
        <Card className="border-emerald-200 bg-emerald-50 text-emerald-800">
          <p className="text-sm font-medium">{params.success}</p>
        </Card>
      ) : null}
      {!canManageProjects ? (
        <Card className="border-amber-200 bg-amber-50 text-amber-900">
          <p className="text-sm font-medium">Your current role can view projects you belong to, but only Admins and Managers can create or edit projects.</p>
        </Card>
      ) : null}
      <ProjectsView projects={projects} profiles={profiles} canManageProjects={canManageProjects} />
    </div>
  );
}
