import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { ProjectDetailTabs } from "@/components/projects/project-detail-tabs";
import { getCurrentProfile, getProjectDetail, getProjects, getTeamMembers } from "@/lib/data/queries";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [detail, projects, teamMembers, currentProfile] = await Promise.all([
    getProjectDetail(id).catch(() => null),
    getProjects(),
    getTeamMembers(),
    getCurrentProfile().catch(() => null)
  ]);

  if (!detail) {
    notFound();
  }

  const profiles = teamMembers.map(({ activeProjects, assignedTasks, workloadSummary, ...profile }) => profile);

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Project Detail" title={detail.project.name} />
      <ProjectDetailTabs
        project={detail.project}
        tasks={detail.tasks}
        activity={detail.activity}
        comments={detail.comments}
        attachments={detail.attachments}
        profiles={profiles}
        projects={projects}
        currentUserRole={currentProfile?.role ?? null}
      />
    </div>
  );
}
