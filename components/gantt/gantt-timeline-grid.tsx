"use client";

import { resolveTaskDependencyNames } from "@/lib/utils/task-dependencies";
import {
  GANTT_LEFT_PANEL_WIDTH,
  GANTT_ROW_HEIGHT,
  getTaskBarMetrics,
  getTodayLineOffset,
  getWeekendColumns,
  type GanttScale,
  type GanttScheduledTask,
  type GanttTimelineSegment
} from "@/lib/utils/gantt";
import type { Profile, Project, Task } from "@/lib/types/domain";
import { TaskFormModal } from "@/components/tasks/task-form-modal";
import { GanttDependencyLines } from "@/components/gantt/gantt-dependency-lines";
import { GanttTaskBar } from "@/components/gantt/gantt-task-bar";
import { GanttTaskList } from "@/components/gantt/gantt-task-list";
import { GanttTimelineHeader } from "@/components/gantt/gantt-timeline-header";

export function GanttTimelineGrid({
  tasks,
  allTasks,
  profiles,
  projects,
  timelineStart,
  timelineEnd,
  scale,
  monthSegments,
  scaleSegments,
  timelineWidth
}: {
  tasks: GanttScheduledTask[];
  allTasks: Task[];
  profiles: Profile[];
  projects: Project[];
  timelineStart: Date;
  timelineEnd: Date;
  scale: GanttScale;
  monthSegments: GanttTimelineSegment[];
  scaleSegments: GanttTimelineSegment[];
  timelineWidth: number;
}) {
  const weekendColumns = getWeekendColumns(timelineStart, timelineEnd, scale);
  const todayLineOffset = getTodayLineOffset(timelineStart, timelineEnd, scale);

  return (
    <div className="overflow-auto rounded-2xl border border-gray-200 bg-white shadow-[rgba(0,0,0,0.04)_0px_18px_50px]">
      <div className="min-w-max">
        <div
          className="sticky top-0 z-40 grid border-b border-slate-200 bg-white"
          style={{ gridTemplateColumns: `${GANTT_LEFT_PANEL_WIDTH}px ${timelineWidth}px` }}
        >
          <div className="sticky left-0 z-50 border-r border-slate-200 bg-white">
            <GanttTaskList />
          </div>
          <GanttTimelineHeader
            monthSegments={monthSegments}
            scaleSegments={scaleSegments}
            scale={scale}
            timelineWidth={timelineWidth}
          />
        </div>

        <div className="relative" style={{ minHeight: tasks.length * GANTT_ROW_HEIGHT }}>
          <div
            className="absolute bottom-0 right-0 top-0"
            style={{ left: GANTT_LEFT_PANEL_WIDTH, width: timelineWidth }}
          >
            {weekendColumns.map((column) => (
              <div
                key={column.key}
                className="absolute bottom-0 top-0 bg-slate-100/75"
                style={{ left: column.left, width: column.width }}
              />
            ))}
            {todayLineOffset != null ? (
              <div className="absolute bottom-0 top-0 z-20 w-[2px] bg-[#0071e3]/80" style={{ left: todayLineOffset }} />
            ) : null}
            <GanttDependencyLines
              tasks={tasks}
              timelineStart={timelineStart}
              timelineEnd={timelineEnd}
              scale={scale}
              timelineWidth={timelineWidth}
            />
          </div>

          {tasks.map((task, index) => {
            const bar = getTaskBarMetrics(task, timelineStart, timelineEnd, scale);
            const dependencyNames = resolveTaskDependencyNames(task, allTasks);

            return (
              <TaskFormModal
                key={task.id}
                profiles={profiles}
                projects={projects}
                availableTasks={allTasks}
                task={task}
                initialMode="view"
                renderTrigger={({ open, ariaLabel, title }) => (
                  <button
                    type="button"
                    onClick={open}
                    aria-label={ariaLabel ?? `Open ${task.title}`}
                    className="grid min-w-max text-left transition hover:bg-slate-50/80 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/40 focus:ring-inset"
                    style={{
                      gridTemplateColumns: `${GANTT_LEFT_PANEL_WIDTH}px ${timelineWidth}px`,
                      minHeight: GANTT_ROW_HEIGHT
                    }}
                  >
                    <div
                      className="sticky left-0 z-20 border-r border-slate-200 bg-white/95 backdrop-blur"
                      style={{ height: GANTT_ROW_HEIGHT }}
                    >
                      <GanttTaskList task={task} />
                    </div>
                    <div className="relative border-b border-slate-200" style={{ height: GANTT_ROW_HEIGHT }}>
                      <div className="absolute inset-y-0 left-0 right-0 border-r border-slate-200/70" />
                      <GanttTaskBar
                        task={task}
                        left={bar.left}
                        width={bar.width}
                        clippedStart={bar.clippedStart}
                        clippedEnd={bar.clippedEnd}
                        dependencyNames={dependencyNames}
                      />
                      {todayLineOffset != null ? (
                        <div className="absolute inset-y-0 z-10 w-[2px] bg-[#0071e3]/40" style={{ left: todayLineOffset }} />
                      ) : null}
                    </div>
                  </button>
                )}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
