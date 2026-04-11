import type { Task } from "@/lib/types/domain";

export type DueDateSortDirection = "asc" | "desc";

function parseDueDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : timestamp;
}

export function sortTasksByDueDate(tasks: Task[], direction: DueDateSortDirection): Task[] {
  return [...tasks]
    .map((task, index) => ({ task, index }))
    .sort((left, right) => {
      const leftTime = parseDueDate(left.task.due_date);
      const rightTime = parseDueDate(right.task.due_date);

      if (leftTime === null && rightTime === null) {
        return left.index - right.index;
      }

      if (leftTime === null) {
        return 1;
      }

      if (rightTime === null) {
        return -1;
      }

      if (leftTime === rightTime) {
        return left.index - right.index;
      }

      return direction === "asc" ? leftTime - rightTime : rightTime - leftTime;
    })
    .map(({ task }) => task);
}
