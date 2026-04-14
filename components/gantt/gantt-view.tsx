"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { GanttTimelineGrid } from "@/components/gantt/gantt-timeline-grid";
import { GanttToolbar } from "@/components/gantt/gantt-toolbar";
import { formatTaskDate } from "@/lib/utils/task-dates";
import {
  getMonthSegments,
  getScaleSegments,
  getScheduledTasks,
  getTimelineRange,
  getTimelineWidth,
  taskOverlapsRange,
  type GanttDateRangeOption,
  type GanttScale
} from "@/lib/utils/gantt";
import type { Profile, Project, Task, TaskStatus } from "@/lib/types/domain";

export function GanttView({
  tasks,
  projects,
  profiles
}: {
  tasks: Task[];
  projects: Project[];
  profiles: Profile[];
}) {
  const [query, setQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<"All" | TaskStatus>("All");
  const [assigneeFilter, setAssigneeFilter] = useState("All");
  const [dateRange, setDateRange] = useState<GanttDateRangeOption>("180d");
  const [scale, setScale] = useState<GanttScale>("week");

  const { scheduledTasks, excludedCount } = useMemo(() => getScheduledTasks(tasks), [tasks]);

  const filteredTasks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return scheduledTasks.filter((task) => {
      const matchesQuery =
        !normalizedQuery ||
        task.title.toLowerCase().includes(normalizedQuery) ||
        task.project?.name.toLowerCase().includes(normalizedQuery);
      const matchesProject = projectFilter === "All" || task.project_id === projectFilter;
      const matchesStatus = statusFilter === "All" || task.status === statusFilter;
      const matchesAssignee = assigneeFilter === "All" || task.assignee_id === assigneeFilter;

      return matchesQuery && matchesProject && matchesStatus && matchesAssignee;
    });
  }, [assigneeFilter, projectFilter, query, scheduledTasks, statusFilter]);

  const timelineRange = useMemo(() => getTimelineRange(filteredTasks.length ? filteredTasks : scheduledTasks, dateRange), [dateRange, filteredTasks, scheduledTasks]);

  const visibleTasks = useMemo(
    () => filteredTasks.filter((task) => taskOverlapsRange(task, timelineRange.start, timelineRange.end)),
    [filteredTasks, timelineRange.end, timelineRange.start]
  );

  const timelineWidth = useMemo(() => getTimelineWidth(timelineRange.start, timelineRange.end, scale), [scale, timelineRange.end, timelineRange.start]);
  const monthSegments = useMemo(() => getMonthSegments(timelineRange.start, timelineRange.end, scale), [scale, timelineRange.end, timelineRange.start]);
  const scaleSegments = useMemo(() => getScaleSegments(timelineRange.start, timelineRange.end, scale), [scale, timelineRange.end, timelineRange.start]);

  if (!scheduledTasks.length) {
    return (
      <EmptyState
        title="No scheduled tasks to display"
        description="Add start and due dates to tasks to see them on the Gantt chart"
      />
    );
  }

  return (
    <div className="space-y-5">
      <GanttToolbar
        projects={projects}
        profiles={profiles}
        query={query}
        onQueryChange={setQuery}
        projectFilter={projectFilter}
        onProjectFilterChange={setProjectFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        assigneeFilter={assigneeFilter}
        onAssigneeFilterChange={setAssigneeFilter}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        scale={scale}
        onScaleChange={setScale}
      />

      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
        <p>{visibleTasks.length} scheduled tasks in view</p>
        {excludedCount ? <p>{excludedCount} excluded for missing or invalid dates</p> : null}
      </div>

      {visibleTasks.length ? (
        <>
          <div className="space-y-4 sm:hidden">
            <p className="text-sm text-slate-500">Mobile view shows a simplified schedule summary. Use a larger screen for full chart interaction.</p>
            {visibleTasks.map((task) => (
              <Card key={task.id} className="space-y-4 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="break-words font-semibold text-slate-950">{task.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{task.project?.name ?? "No project"}</p>
                  </div>
                  <Badge value={task.status} />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge value={task.priority} />
                  {task.isMilestone ? <Badge value="Milestone" /> : null}
                </div>
                <div className="grid gap-2 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                  <div className="flex items-center justify-between gap-3">
                    <span>Start</span>
                    <span className="text-right text-slate-900">{formatTaskDate(task.start_date)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Due</span>
                    <span className="text-right text-slate-900">{formatTaskDate(task.due_date)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Assignee</span>
                    <span className="text-right text-slate-900">{task.assignee?.full_name ?? "Unassigned"}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div className="hidden sm:block">
            <GanttTimelineGrid
              tasks={visibleTasks}
              allTasks={tasks}
              profiles={profiles}
              projects={projects}
              timelineStart={timelineRange.start}
              timelineEnd={timelineRange.end}
              scale={scale}
              monthSegments={monthSegments}
              scaleSegments={scaleSegments}
              timelineWidth={timelineWidth}
            />
          </div>
        </>
      ) : (
        <EmptyState
          title="No scheduled tasks to display"
          description="Add start and due dates to tasks to see them on the Gantt chart"
        />
      )}
    </div>
  );
}
