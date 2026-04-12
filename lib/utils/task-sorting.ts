import type { Task } from "@/lib/types/domain";
import { getTaskDateTimestamp } from "@/lib/utils/task-dates";

export type DueDateSortDirection = "asc" | "desc";

export function sortTasksByDueDate(tasks: Task[], direction: DueDateSortDirection): Task[] {
  return [...tasks]
    .map((task, index) => ({ task, index }))
    .sort((left, right) => {
      const leftTime = getTaskDateTimestamp(left.task.due_date);
      const rightTime = getTaskDateTimestamp(right.task.due_date);

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
