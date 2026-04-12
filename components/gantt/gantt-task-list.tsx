import type { GanttScheduledTask } from "@/lib/utils/gantt";

export function GanttTaskList({ task }: { task?: GanttScheduledTask }) {
  if (!task) {
    return (
      <div className="grid h-[88px] grid-cols-[minmax(280px,1fr)] items-center px-5">
        {["Task Name"].map((label) => (
          <span key={label} className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {label}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="grid h-[76px] grid-cols-[minmax(280px,1fr)] items-center px-5">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-950">{task.title}</p>
        <p className="mt-1 truncate text-xs text-slate-500">
          {task.project?.name ?? "No project"}
          {task.isMilestone ? " • Milestone" : ""}
        </p>
      </div>
    </div>
  );
}
