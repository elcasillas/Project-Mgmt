"use client";

import { useMemo, useState } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { GanttTimelineGrid } from "@/components/gantt/gantt-timeline-grid";
import { GanttToolbar } from "@/components/gantt/gantt-toolbar";
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
      ) : (
        <EmptyState
          title="No scheduled tasks to display"
          description="Add start and due dates to tasks to see them on the Gantt chart"
        />
      )}
    </div>
  );
}
