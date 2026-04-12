import { GanttView } from "@/components/gantt/gantt-view";
import { PageHeader } from "@/components/shared/page-header";
import { getProjects, getTasks, getTeamMembers } from "@/lib/data/queries";

export default async function GanttPage() {
  const [tasks, projects, teamMembers] = await Promise.all([getTasks(), getProjects(), getTeamMembers()]);
  const profiles = teamMembers.map(({ activeProjects, assignedTasks, workloadSummary, ...profile }) => profile);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Execution Timeline"
        title="Gantt Chart"
        description="Timeline view of project execution across tasks and milestones"
      />
      <GanttView tasks={tasks} projects={projects} profiles={profiles} />
    </div>
  );
}
