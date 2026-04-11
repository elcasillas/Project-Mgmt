import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { ProjectDetailTabs } from "@/components/projects/project-detail-tabs";
import { AvatarGroup } from "@/components/ui/avatar-group";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getCurrentProfile, getProjectDetail, getProjects, getTeamMembers } from "@/lib/data/queries";
import { formatDate } from "@/lib/utils/format";

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
      <Card className="space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge value={detail.project.status} />
              <Badge value={detail.project.priority} />
            </div>
          </div>
          <div className="min-w-[220px] space-y-3">
            <p className="text-sm text-slate-500">Target end date</p>
            <p className="font-medium text-slate-950">{formatDate(detail.project.target_end_date)}</p>
            <AvatarGroup users={detail.project.members ?? []} />
          </div>
        </div>
        <Progress value={detail.project.progress} />
      </Card>
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
