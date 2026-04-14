"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, Trash } from "lucide-react";
import { deleteTaskAction } from "@/lib/actions/workspace";
import { ConfirmActionButton } from "@/components/shared/confirm-action-button";
import { TaskFormModal } from "@/components/tasks/task-form-modal";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatTaskDate } from "@/lib/utils/task-dates";
import { sortTasksByDueDate, type DueDateSortDirection } from "@/lib/utils/task-sorting";
import { resolveTaskDependencyNames } from "@/lib/utils/task-dependencies";
import type { Profile, Project, Task } from "@/lib/types/domain";

export function TaskTable({
  tasks,
  allTasks = tasks,
  profiles,
  projects,
  selectedTaskId,
  canEditTasks = true,
  redirectPath
}: {
  tasks: Task[];
  allTasks?: Task[];
  profiles: Profile[];
  projects: Project[];
  selectedTaskId?: string;
  canEditTasks?: boolean;
  redirectPath?: string;
}) {
  const [dueDateSort, setDueDateSort] = useState<DueDateSortDirection>("asc");
  const taskActionButtonClassName =
    "h-9 w-9 rounded-md border border-gray-200 bg-transparent p-0 text-slate-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#00ADB1]";
  const taskDeleteButtonClassName = `${taskActionButtonClassName} hover:text-red-600 active:text-red-600`;
  const visibleTasks = useMemo(() => sortTasksByDueDate(tasks, dueDateSort), [dueDateSort, tasks]);

  if (!tasks.length) {
    return (
      <Card className="p-6">
        <p className="text-sm text-slate-500">No tasks found.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:hidden">
        {visibleTasks.map((task) => {
          const dependencyNames = resolveTaskDependencyNames(task, allTasks);

          return (
            <Card key={task.id} className={task.id === selectedTaskId ? "border-sky-200 bg-sky-50/50 p-4" : "p-4"}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <TaskFormModal
                    profiles={profiles}
                    projects={projects}
                    availableTasks={allTasks}
                    task={task}
                    initialMode="view"
                    redirectPath={redirectPath}
                    renderTrigger={({ open, ariaLabel, title }) => (
                      <button
                        type="button"
                        onClick={open}
                        aria-label={ariaLabel ?? `View task ${task.title}`}
                        title={title ?? `View task ${task.title}`}
                        className="cursor-pointer break-words text-left font-medium text-slate-950 transition hover:text-[#00ADB1] hover:underline focus:outline-none focus:text-[#00ADB1]"
                      >
                        {task.title}
                      </button>
                    )}
                  />
                  <p className="mt-1 text-sm text-slate-500">{task.project?.name ?? "No project"}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  {canEditTasks ? (
                    <ConfirmActionButton
                      action={deleteTaskAction}
                      fields={[{ name: "task_id", value: task.id }]}
                      variant="ghost"
                      size="sm"
                      className={taskDeleteButtonClassName}
                      aria-label="Delete Task"
                      title="Delete Task"
                    >
                      <Trash className="h-4 w-4" />
                    </ConfirmActionButton>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge value={task.status} />
                <Badge value={task.priority} />
              </div>

              <div className="mt-4 grid gap-3 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-slate-500">Assignee</span>
                  <span className="text-right text-slate-900">{task.assignee?.full_name ?? "Unassigned"}</span>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <span className="text-slate-500">Due date</span>
                  <span className="text-right text-slate-900">{formatTaskDate(task.due_date)}</span>
                </div>
                <div className="space-y-2">
                  <span className="text-slate-500">Dependencies</span>
                  {dependencyNames.length ? (
                    <div className="flex flex-wrap gap-2">
                      {dependencyNames.map((dependencyName) => (
                        <span
                          key={`${task.id}:${dependencyName}`}
                          className="max-w-full rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-slate-600"
                        >
                          {dependencyName}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-900">None</span>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="hidden overflow-hidden p-0 md:block">
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100 text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-6 py-4 font-medium">Task</th>
              <th className="px-6 py-4 font-medium">Project</th>
              <th className="px-6 py-4 font-medium">Dependencies</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Priority</th>
              <th className="px-6 py-4 font-medium">Assignee</th>
              <th className="px-6 py-4 font-medium" aria-sort={dueDateSort === "asc" ? "ascending" : "descending"}>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-inherit transition hover:text-slate-700 focus:outline-none focus:text-slate-700"
                  onClick={() => setDueDateSort((current) => (current === "asc" ? "desc" : "asc"))}
                  title={dueDateSort === "asc" ? "Sort due date descending" : "Sort due date ascending"}
                >
                  <span>Due date</span>
                  {dueDateSort === "asc" ? (
                    <ArrowUp className="h-4 w-4" />
                  ) : dueDateSort === "desc" ? (
                    <ArrowDown className="h-4 w-4" />
                  ) : (
                    <ArrowUpDown className="h-4 w-4" />
                  )}
                </button>
              </th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleTasks.map((task) => {
              const dependencyNames = resolveTaskDependencyNames(task, allTasks);

              return (
                <tr key={task.id} className={task.id === selectedTaskId ? "bg-sky-50/70" : ""}>
                  <td className="px-6 py-4 align-top">
                    <TaskFormModal
                      profiles={profiles}
                      projects={projects}
                      availableTasks={allTasks}
                      task={task}
                      initialMode="view"
                      redirectPath={redirectPath}
                      renderTrigger={({ open, ariaLabel, title }) => (
                        <button
                          type="button"
                          onClick={open}
                          aria-label={ariaLabel ?? `View task ${task.title}`}
                          title={title ?? `View task ${task.title}`}
                          className="cursor-pointer text-left font-medium text-slate-950 transition hover:text-[#00ADB1] hover:underline focus:outline-none focus:text-[#00ADB1]"
                        >
                          {task.title}
                        </button>
                      )}
                    />
                  </td>
                  <td className="px-6 py-4 align-top text-slate-600">{task.project?.name ?? "No project"}</td>
                  <td className="px-6 py-4 align-top">
                    {dependencyNames.length ? (
                      <div className="flex max-w-[260px] flex-wrap gap-2">
                        {dependencyNames.map((dependencyName) => (
                          <span
                            key={`${task.id}:${dependencyName}`}
                            title={dependencyName}
                            className="max-w-full truncate rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-slate-600"
                          >
                            {dependencyName}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-500">None</span>
                    )}
                  </td>
                  <td className="px-6 py-4 align-top">
                    <Badge value={task.status} />
                  </td>
                  <td className="px-6 py-4 align-top">
                    <Badge value={task.priority} />
                  </td>
                  <td className="px-6 py-4 align-top text-slate-600">{task.assignee?.full_name ?? "Unassigned"}</td>
                  <td className="px-6 py-4 align-top text-slate-600">{formatTaskDate(task.due_date)}</td>
                  <td className="px-6 py-4 align-top">
                    <div className="flex gap-2">
                      {canEditTasks ? (
                        <ConfirmActionButton
                          action={deleteTaskAction}
                          fields={[{ name: "task_id", value: task.id }]}
                          variant="ghost"
                          size="sm"
                          className={taskDeleteButtonClassName}
                          aria-label="Delete Task"
                          title="Delete Task"
                        >
                          <Trash className="h-4 w-4" />
                        </ConfirmActionButton>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      </Card>
    </div>
  );
}
