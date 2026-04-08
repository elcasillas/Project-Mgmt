import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/format";
import type { Task } from "@/lib/types/domain";

export function RecentTasksPanel({ tasks }: { tasks: Task[] }) {
  return (
    <Card className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">Recent Tasks</h2>
        <p className="text-sm text-slate-500">Fresh task updates and upcoming due dates.</p>
      </div>
      <div className="space-y-4">
        {tasks.map((task) => (
          <Link key={task.id} href={`/tasks?task=${task.id}`} className="block rounded-2xl border border-slate-100 p-4 transition hover:border-sky-200 hover:bg-sky-50/60">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium text-slate-950">{task.title}</p>
              <Badge value={task.status} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
              <span>{task.project?.name ?? "No project"}</span>
              <span>Due {formatDate(task.due_date)}</span>
              <span>{task.assignee?.full_name ?? "Unassigned"}</span>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
