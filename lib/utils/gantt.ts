import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  eachMonthOfInterval,
  eachWeekOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isValid,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays
} from "date-fns";
import type { Task } from "@/lib/types/domain";

export type GanttScale = "day" | "week" | "month";
export type GanttDateRangeOption = "90d" | "180d" | "365d" | "all";

export type GanttScheduledTask = Task & {
  ganttStartDate: Date;
  ganttEndDate: Date;
  durationInDays: number;
  isMilestone: boolean;
  progressValue: number;
};

export type GanttTimelineSegment = {
  key: string;
  label: string;
  shortLabel?: string;
  start: Date;
  end: Date;
  width: number;
};

export const GANTT_ROW_HEIGHT = 76;
export const GANTT_LEFT_PANEL_WIDTH = 760;

const SCALE_DAY_WIDTH: Record<GanttScale, number> = {
  day: 44,
  week: 16,
  month: 6
};

function parseTaskDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const parsed = parseISO(value);
  return isValid(parsed) ? startOfDay(parsed) : null;
}

function clampProgress(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function getTaskProgressValue(task: Task) {
  if (task.status === "Done") {
    return 100;
  }

  if (typeof task.actual_hours === "number" && typeof task.estimated_hours === "number" && task.estimated_hours > 0) {
    return clampProgress((task.actual_hours / task.estimated_hours) * 100);
  }

  const statusFallbacks: Record<Task["status"], number> = {
    "Not Started": 0,
    "In Progress": 55,
    Blocked: 35,
    "In Review": 85,
    Done: 100
  };

  return statusFallbacks[task.status] ?? 0;
}

export function getScheduledTasks(tasks: Task[]) {
  const scheduledTasks: GanttScheduledTask[] = [];
  let excludedCount = 0;

  for (const task of tasks) {
    const startDate = parseTaskDate(task.start_date);
    const endDate = parseTaskDate(task.due_date);

    if (!startDate || !endDate || differenceInCalendarDays(endDate, startDate) < 0) {
      excludedCount += 1;
      continue;
    }

    scheduledTasks.push({
      ...task,
      ganttStartDate: startDate,
      ganttEndDate: endDate,
      durationInDays: differenceInCalendarDays(endDate, startDate) + 1,
      isMilestone: differenceInCalendarDays(endDate, startDate) === 0,
      progressValue: getTaskProgressValue(task)
    });
  }

  scheduledTasks.sort((left, right) => {
    const startDelta = left.ganttStartDate.getTime() - right.ganttStartDate.getTime();
    if (startDelta !== 0) {
      return startDelta;
    }

    const endDelta = left.ganttEndDate.getTime() - right.ganttEndDate.getTime();
    if (endDelta !== 0) {
      return endDelta;
    }

    return left.title.localeCompare(right.title);
  });

  return { scheduledTasks, excludedCount };
}

export function getScaleDayWidth(scale: GanttScale) {
  return SCALE_DAY_WIDTH[scale];
}

export function getTimelineWidth(start: Date, end: Date, scale: GanttScale) {
  return (differenceInCalendarDays(end, start) + 1) * getScaleDayWidth(scale);
}

export function getTimelineRange(tasks: GanttScheduledTask[], range: GanttDateRangeOption) {
  if (!tasks.length) {
    const today = startOfDay(new Date());
    return {
      start: startOfWeek(subDays(today, 14), { weekStartsOn: 1 }),
      end: endOfWeek(addDays(today, 45), { weekStartsOn: 1 })
    };
  }

  const earliest = tasks.reduce((current, task) => (task.ganttStartDate < current ? task.ganttStartDate : current), tasks[0].ganttStartDate);
  const latest = tasks.reduce((current, task) => (task.ganttEndDate > current ? task.ganttEndDate : current), tasks[0].ganttEndDate);

  if (range === "all") {
    return {
      start: startOfWeek(subDays(earliest, 7), { weekStartsOn: 1 }),
      end: endOfWeek(addDays(latest, 7), { weekStartsOn: 1 })
    };
  }

  const dayCount = range === "90d" ? 90 : range === "180d" ? 180 : 365;
  const start = startOfWeek(earliest, { weekStartsOn: 1 });

  return {
    start,
    end: endOfWeek(addDays(start, dayCount - 1), { weekStartsOn: 1 })
  };
}

export function taskOverlapsRange(task: GanttScheduledTask, start: Date, end: Date) {
  return task.ganttEndDate >= start && task.ganttStartDate <= end;
}

export function getTaskBarMetrics(task: GanttScheduledTask, timelineStart: Date, timelineEnd: Date, scale: GanttScale) {
  const dayWidth = getScaleDayWidth(scale);
  const visibleStart = task.ganttStartDate < timelineStart ? timelineStart : task.ganttStartDate;
  const visibleEnd = task.ganttEndDate > timelineEnd ? timelineEnd : task.ganttEndDate;
  const dayOffset = differenceInCalendarDays(visibleStart, timelineStart);
  const visibleDuration = differenceInCalendarDays(visibleEnd, visibleStart) + 1;
  const left = dayOffset * dayWidth;
  const width = Math.max(visibleDuration * dayWidth, task.isMilestone ? 18 : dayWidth * 0.75);

  return {
    left,
    width,
    clippedStart: task.ganttStartDate < timelineStart,
    clippedEnd: task.ganttEndDate > timelineEnd
  };
}

export function getWeekendColumns(start: Date, end: Date, scale: GanttScale) {
  const dayWidth = getScaleDayWidth(scale);

  return eachDayOfInterval({ start, end })
    .filter((date) => date.getDay() === 0 || date.getDay() === 6)
    .map((date) => ({
      key: format(date, "yyyy-MM-dd"),
      left: differenceInCalendarDays(date, start) * dayWidth,
      width: dayWidth
    }));
}

export function getTodayLineOffset(start: Date, end: Date, scale: GanttScale) {
  const today = startOfDay(new Date());
  if (today < start || today > end) {
    return null;
  }

  return differenceInCalendarDays(today, start) * getScaleDayWidth(scale) + getScaleDayWidth(scale) / 2;
}

export function getMonthSegments(start: Date, end: Date, scale: GanttScale): GanttTimelineSegment[] {
  const dayWidth = getScaleDayWidth(scale);

  return eachMonthOfInterval({ start, end }).map((monthDate) => {
    const segmentStart = monthDate < start ? start : startOfMonth(monthDate);
    const segmentEnd = endOfMonth(monthDate) > end ? end : endOfMonth(monthDate);
    const days = differenceInCalendarDays(segmentEnd, segmentStart) + 1;

    return {
      key: `month-${format(monthDate, "yyyy-MM")}`,
      label: format(monthDate, "MMMM yyyy"),
      start: segmentStart,
      end: segmentEnd,
      width: days * dayWidth
    };
  });
}

export function getScaleSegments(start: Date, end: Date, scale: GanttScale): GanttTimelineSegment[] {
  const dayWidth = getScaleDayWidth(scale);

  if (scale === "day") {
    return eachDayOfInterval({ start, end }).map((date) => ({
      key: `day-${format(date, "yyyy-MM-dd")}`,
      label: format(date, "d"),
      shortLabel: format(date, "EEE"),
      start: date,
      end: endOfDay(date),
      width: dayWidth
    }));
  }

  if (scale === "week") {
    return eachWeekOfInterval({ start, end }, { weekStartsOn: 1 }).map((weekStart) => {
      const segmentStart = weekStart < start ? start : weekStart;
      const segmentEnd = endOfWeek(weekStart, { weekStartsOn: 1 }) > end ? end : endOfWeek(weekStart, { weekStartsOn: 1 });
      const days = differenceInCalendarDays(segmentEnd, segmentStart) + 1;

      return {
        key: `week-${format(weekStart, "yyyy-MM-dd")}`,
        label: `${format(segmentStart, "MMM d")} - ${format(segmentEnd, "MMM d")}`,
        shortLabel: `Wk ${format(weekStart, "I")}`,
        start: segmentStart,
        end: segmentEnd,
        width: days * dayWidth
      };
    });
  }

  return eachMonthOfInterval({ start, end }).map((monthStart) => {
    const segmentStart = monthStart < start ? start : monthStart;
    const segmentEnd = endOfMonth(monthStart) > end ? end : endOfMonth(monthStart);
    const days = differenceInCalendarDays(segmentEnd, segmentStart) + 1;

    return {
      key: `scale-month-${format(monthStart, "yyyy-MM")}`,
      label: format(monthStart, "MMMM"),
      shortLabel: format(monthStart, "yyyy"),
      start: segmentStart,
      end: segmentEnd,
      width: days * dayWidth
    };
  });
}
