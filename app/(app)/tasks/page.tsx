import { PageHeader } from "@/components/shared/page-header";
import { TasksView } from "@/components/tasks/tasks-view";
import { Card } from "@/components/ui/card";
import { getProjects, getTaskAttachments, getTasks, getTeamMembers } from "@/lib/data/queries";

export default async function TasksPage({
  searchParams
}: {
  searchParams: Promise<{ task?: string; error?: string; success?: string }>;
}) {
  const params = await searchParams;
  const [tasks, projects, teamMembers] = await Promise.all([getTasks(), getProjects(), getTeamMembers()]);
  const attachments = await getTaskAttachments(tasks.map((task) => task.id));
  const profiles = teamMembers.map(({ activeProjects, assignedTasks, workloadSummary, ...profile }) => profile);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Execution"
        title="Tasks"
        description="Track work across table, kanban, and calendar views with clear ownership and delivery status."
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
      <TasksView
        tasks={tasks}
        projects={projects}
        profiles={profiles}
        attachments={attachments}
        selectedTaskId={params.task}
      />
    </div>
  );
}
