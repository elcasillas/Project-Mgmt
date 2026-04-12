import { Badge } from "@/components/ui/badge";
import type { GanttScheduledTask } from "@/lib/utils/gantt";

export function GanttTaskList({ task }: { task?: GanttScheduledTask }) {
  if (!task) {
    return (
      <div className="grid h-[88px] grid-cols-[minmax(260px,1.9fr)_130px_96px] items-center gap-4 px-5">
        {["Task Name", "Status", "Progress"].map((label) => (
          <span key={label} className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {label}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="grid h-[76px] grid-cols-[minmax(260px,1.9fr)_130px_96px] items-center gap-4 px-5">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-950">{task.title}</p>
        <p className="mt-1 truncate text-xs text-slate-500">
          {task.project?.name ?? "No project"}
          {task.isMilestone ? " • Milestone" : ""}
        </p>
      </div>
      <div className="min-w-0">
        <Badge value={task.status} className="max-w-full truncate align-middle" />
      </div>
      <p className="text-sm font-medium text-slate-700">{task.progressValue}%</p>
    </div>
  );
}
