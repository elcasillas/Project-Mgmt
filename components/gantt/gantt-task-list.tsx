import { Badge } from "@/components/ui/badge";
import { formatTaskDate } from "@/lib/utils/task-dates";
import type { GanttScheduledTask } from "@/lib/utils/gantt";

export function GanttTaskList({ task }: { task?: GanttScheduledTask }) {
  if (!task) {
    return (
      <div className="grid h-[88px] grid-cols-[minmax(220px,2.1fr)_minmax(150px,1.2fr)_minmax(140px,1.1fr)_110px_110px_120px_96px] items-center gap-4 px-5">
        {["Task Name", "Project", "Assignee", "Start Date", "Due Date", "Status", "Progress"].map((label) => (
          <span key={label} className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {label}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="grid h-[76px] grid-cols-[minmax(220px,2.1fr)_minmax(150px,1.2fr)_minmax(140px,1.1fr)_110px_110px_120px_96px] items-center gap-4 px-5">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-950">{task.title}</p>
        {task.isMilestone ? <p className="mt-1 text-xs text-slate-500">Milestone</p> : null}
      </div>
      <p className="truncate text-sm text-slate-600">{task.project?.name ?? "No project"}</p>
      <p className="truncate text-sm text-slate-600">{task.assignee?.full_name ?? "Unassigned"}</p>
      <p className="text-sm text-slate-600">{formatTaskDate(task.start_date)}</p>
      <p className="text-sm text-slate-600">{formatTaskDate(task.due_date)}</p>
      <div className="min-w-0">
        <Badge value={task.status} className="max-w-full truncate align-middle" />
      </div>
      <p className="text-sm font-medium text-slate-700">{task.progressValue}%</p>
    </div>
  );
}
