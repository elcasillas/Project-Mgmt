import type { Task } from "@/lib/types/domain";

export type DueDateSortDirection = "asc" | "desc";

export function sortTasksByDueDate(tasks: Task[], direction: DueDateSortDirection): Task[] {
  return [...tasks]
    .map((task, index) => ({ task, index }))
    .sort((left, right) => {
      const leftTime = left.task.due_date ? Date.parse(left.task.due_date) : null;
      const rightTime = right.task.due_date ? Date.parse(right.task.due_date) : null;

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
