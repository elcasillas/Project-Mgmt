"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TaskFormModal } from "@/components/tasks/task-form-modal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { darkenColor, getContrastTextColor, getStatusTone } from "@/lib/utils/status-colors";
import type { Profile, Project, Task } from "@/lib/types/domain";

export function TasksCalendar({
  tasks,
  profiles,
  projects,
  availableTasks = tasks,
  redirectPath,
  title = "Calendar view",
  description = "Tasks grouped by due date in a standard monthly calendar."
}: {
  tasks: Task[];
  profiles: Profile[];
  projects: Project[];
  availableTasks?: Task[];
  redirectPath?: string;
  title?: string;
  description?: string;
}) {
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
  const calendarDays = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(startOfMonth(visibleMonth), { weekStartsOn: 0 }),
        end: endOfWeek(endOfMonth(visibleMonth), { weekStartsOn: 0 })
      }),
    [visibleMonth]
  );
  const calendarWeeks = useMemo(() => {
    const weeks: Date[][] = [];
    for (let index = 0; index < calendarDays.length; index += 7) {
      weeks.push(calendarDays.slice(index, index + 7));
    }
    return weeks;
  }, [calendarDays]);
  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Card className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto">
          <Button variant="secondary" size="sm" onClick={() => setVisibleMonth((current) => subMonths(current, 1))} aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-[180px] text-center">
            <p className="text-sm font-medium text-slate-900">{format(visibleMonth, "MMMM yyyy")}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setVisibleMonth((current) => addMonths(current, 1))} aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[840px]">
          <div className="grid grid-cols-7 border-b border-slate-100">
            {weekdayLabels.map((label) => (
              <div key={label} className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {label}
              </div>
            ))}
          </div>
          <div className="space-y-0">
            {calendarWeeks.map((week, weekIndex) => (
              <div key={`${format(visibleMonth, "yyyy-MM")}-week-${weekIndex}`} className="grid grid-cols-7">
                {week.map((day) => {
                  const dayTasks = tasks.filter((task) => task.due_date === format(day, "yyyy-MM-dd"));
                  const inVisibleMonth = isSameMonth(day, visibleMonth);
                  const isCurrentDay = isToday(day);

                  return (
                    <div
                      key={day.toISOString()}
                      className={`min-h-[160px] border-b border-r border-slate-100 p-3 align-top ${
                        inVisibleMonth ? "bg-white" : "bg-slate-50/70"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
                            isCurrentDay ? "bg-[#0071e3] text-white" : inVisibleMonth ? "text-slate-900" : "text-slate-400"
                          }`}
                        >
                          {format(day, "d")}
                        </span>
                      </div>
                      <div className="mt-3 space-y-2">
                        {dayTasks.map((task) => {
                          const tone = getStatusTone(task.status);
                          const textColor = getContrastTextColor(tone.background);
                          const borderColor = darkenColor(tone.background, 0.1);

                          return (
                            <TaskFormModal
                              key={task.id}
                              profiles={profiles}
                              projects={projects}
                              availableTasks={availableTasks}
                              task={task}
                              initialMode="view"
                              redirectPath={redirectPath}
                              triggerVariant="ghost"
                              triggerSize="sm"
                              triggerAriaLabel={`View task ${task.title}`}
                              triggerTitle={`View task ${task.title}`}
                              triggerClassName="h-auto w-full cursor-pointer flex-col items-start rounded-xl p-3 text-left shadow-sm transition-[filter,box-shadow,transform] hover:brightness-95 hover:shadow-md"
                              triggerStyle={{
                                backgroundColor: tone.background,
                                borderColor,
                                color: textColor
                              }}
                              triggerLabel={
                                <>
                                  <span className="text-sm font-medium" style={{ color: textColor }}>
                                    {task.title}
                                  </span>
                                  <span className="mt-1 text-xs" style={{ color: textColor, opacity: 0.82 }}>
                                    {task.project?.name ?? "General task"}
                                  </span>
                                </>
                              }
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
