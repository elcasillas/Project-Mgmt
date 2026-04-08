import { PageHeader } from "@/components/shared/page-header";
import { RecentActivityFeed } from "@/components/dashboard/recent-activity-feed";
import { RecentTasksPanel } from "@/components/dashboard/recent-tasks-panel";
import { StatusChart } from "@/components/dashboard/status-chart";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { RealtimeRefresh } from "@/components/shared/realtime-refresh";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getDashboardMetrics } from "@/lib/data/queries";

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();

  return (
    <div className="space-y-8">
      <RealtimeRefresh tables={["projects", "tasks", "activity_logs"]} />
      <PageHeader
        eyebrow="Overview"
        title="Delivery Dashboard"
        description="Track portfolio momentum, execution risk, and what needs attention this week."
      />
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        <SummaryCard label="Active projects" value={metrics.totalActiveProjects} detail="Projects currently in execution" />
        <SummaryCard label="Total tasks" value={metrics.totalTasks} detail="All tracked work items" />
        <SummaryCard label="Due this week" value={metrics.tasksDueThisWeek} detail="Tasks nearing delivery" />
        <SummaryCard label="Overdue tasks" value={metrics.overdueTasks} detail="Past due and not completed" />
        <SummaryCard label="Projects at risk" value={metrics.projectsAtRisk} detail="Approaching timeline or blocked progress" />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <StatusChart items={metrics.tasksByStatus} />
        <RecentTasksPanel tasks={metrics.recentTasks} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <Card className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Projects at Risk</h2>
            <p className="text-sm text-slate-500">Projects needing intervention based on overdue work or delivery runway.</p>
          </div>
          {metrics.spotlightProjects.map((project) => (
            <div key={project.id} className="rounded-2xl border border-slate-100 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-slate-950">{project.name}</p>
                  <p className="text-sm text-slate-500">{project.status}</p>
                </div>
                <p className="text-sm font-medium text-slate-900">{project.progress}%</p>
              </div>
              <div className="mt-3">
                <Progress value={project.progress} />
              </div>
            </div>
          ))}
        </Card>
        <RecentActivityFeed items={metrics.recentActivity} />
      </div>
    </div>
  );
}
