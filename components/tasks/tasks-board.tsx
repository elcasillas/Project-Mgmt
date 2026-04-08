"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import type { DragEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { TASK_STATUSES } from "@/lib/data/constants";
import { formatDate } from "@/lib/utils/format";
import type { Task, TaskStatus } from "@/lib/types/domain";

async function persistStatus(taskId: string, status: TaskStatus) {
  await fetch(`/api/tasks/${taskId}/status`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ status })
  });
}

export function TasksBoard({ tasks }: { tasks: Task[] }) {
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [optimisticTasks, updateOptimisticTasks] = useOptimistic(tasks, (current, next: { taskId: string; status: TaskStatus }) =>
    current.map((task) => (task.id === next.taskId ? { ...task, status: next.status } : task))
  );

  const grouped = useMemo(() => {
    return TASK_STATUSES.map((status) => ({
      status,
      tasks: optimisticTasks.filter((task) => task.status === status)
    }));
  }, [optimisticTasks]);

  return (
    <div className="grid gap-4 xl:grid-cols-5">
      {grouped.map((column) => (
        <Card
          key={column.status}
          className="min-h-[380px] bg-white p-4"
          onDragOver={(event: DragEvent<HTMLDivElement>) => event.preventDefault()}
          onDrop={(event: DragEvent<HTMLDivElement>) => {
            event.preventDefault();
            if (!draggingTaskId) {
              return;
            }

            updateOptimisticTasks({ taskId: draggingTaskId, status: column.status });
            startTransition(() => {
              persistStatus(draggingTaskId, column.status);
            });
            setDraggingTaskId(null);
          }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">{column.status}</h3>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{column.tasks.length}</span>
          </div>
          <div className="space-y-3">
            {column.tasks.map((task) => (
              <div
                key={task.id}
                draggable
                onDragStart={() => setDraggingTaskId(task.id)}
                className="cursor-grab rounded-2xl border border-gray-200 bg-white p-4 transition hover:bg-gray-50 hover:border-gray-300"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium text-slate-900">{task.title}</p>
                  <Badge value={task.priority} />
                </div>
                <p className="mt-2 text-sm text-slate-500">{task.project?.name ?? "General task"}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span>{task.assignee?.full_name ?? "Unassigned"}</span>
                  <span>Due {formatDate(task.due_date)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
