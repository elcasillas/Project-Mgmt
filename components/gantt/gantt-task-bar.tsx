import { getStatusTone } from "@/lib/utils/status-colors";
import { formatTaskDate } from "@/lib/utils/task-dates";
import type { GanttScheduledTask } from "@/lib/utils/gantt";

export function GanttTaskBar({
  task,
  left,
  width,
  clippedStart,
  clippedEnd,
  dependencyNames
}: {
  task: GanttScheduledTask;
  left: number;
  width: number;
  clippedStart: boolean;
  clippedEnd: boolean;
  dependencyNames: string[];
}) {
  const tone = getStatusTone(task.status);
  const tooltipLabel = [
    `Task: ${task.title}`,
    `Project: ${task.project?.name ?? "No project"}`,
    `Assignee: ${task.assignee?.full_name ?? "Unassigned"}`,
    `Start Date: ${formatTaskDate(task.start_date)}`,
    `Due Date: ${formatTaskDate(task.due_date)}`,
    `Status: ${task.status}`,
    `Progress: ${task.progressValue}%`,
    `Dependencies: ${dependencyNames.length ? dependencyNames.join(", ") : "None"}`
  ].join("\n");

  if (task.isMilestone) {
    return (
      <div className="absolute inset-y-0 flex items-center" style={{ left, width }}>
        <div className="group relative flex items-center" title={tooltipLabel}>
          <div
            className="h-4 w-4 rotate-45 rounded-[4px] border shadow-[rgba(0,0,0,0.12)_0px_8px_20px]"
            style={{ backgroundColor: tone.foreground, borderColor: tone.foreground }}
          />
          <div className="pointer-events-none absolute left-0 top-full z-30 mt-3 hidden w-[280px] rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-[rgba(0,0,0,0.12)_0px_18px_50px] group-hover:block">
            <p className="text-sm font-semibold text-slate-950">{task.title}</p>
            <p className="mt-1 text-xs text-slate-500">{task.project?.name ?? "No project"} • Milestone</p>
            <div className="mt-3 space-y-1.5 text-xs text-slate-600">
              <p>Assignee: {task.assignee?.full_name ?? "Unassigned"}</p>
              <p>Date: {formatTaskDate(task.start_date)}</p>
              <p>Status: {task.status}</p>
              <p>Progress: {task.progressValue}%</p>
              <p>Dependencies: {dependencyNames.length ? dependencyNames.join(", ") : "None"}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-y-0 flex items-center" style={{ left, width }}>
      <div className="group relative w-full" title={tooltipLabel}>
        <div
          className="relative h-9 overflow-hidden rounded-full border shadow-[rgba(0,0,0,0.08)_0px_10px_24px]"
          style={{ backgroundColor: tone.background, borderColor: tone.foreground }}
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ width: `${task.progressValue}%`, backgroundColor: tone.foreground }}
          />
          <div className="relative flex h-full items-center justify-between gap-3 px-3">
            <span className="truncate text-xs font-semibold tracking-[-0.01em] text-slate-900">{task.title}</span>
            <span className="shrink-0 text-[11px] font-semibold text-slate-700">{task.progressValue}%</span>
          </div>
          {clippedStart ? <div className="absolute inset-y-0 left-0 w-1 bg-slate-900/12" /> : null}
          {clippedEnd ? <div className="absolute inset-y-0 right-0 w-1 bg-slate-900/12" /> : null}
        </div>
        <div className="pointer-events-none absolute left-0 top-full z-30 mt-3 hidden w-[300px] rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-[rgba(0,0,0,0.12)_0px_18px_50px] group-hover:block">
          <p className="text-sm font-semibold text-slate-950">{task.title}</p>
          <p className="mt-1 text-xs text-slate-500">{task.project?.name ?? "No project"}</p>
          <div className="mt-3 space-y-1.5 text-xs text-slate-600">
            <p>Assignee: {task.assignee?.full_name ?? "Unassigned"}</p>
            <p>Start Date: {formatTaskDate(task.start_date)}</p>
            <p>Due Date: {formatTaskDate(task.due_date)}</p>
            <p>Status: {task.status}</p>
            <p>Progress: {task.progressValue}%</p>
            <p>Dependencies: {dependencyNames.length ? dependencyNames.join(", ") : "None"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
