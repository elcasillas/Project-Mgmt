import type { Task } from "@/lib/types/domain";

export function resolveTaskDependencyNames(task: Task, tasks: Task[]) {
  const sameProjectTasks = tasks.filter((candidateTask) => candidateTask.project_id === task.project_id);
  const taskMap = new Map(sameProjectTasks.map((candidateTask) => [candidateTask.id, candidateTask.title]));
  const seen = new Set<string>();
  const dependencyNames: string[] = [];

  for (const dependencyId of task.dependency_ids ?? []) {
    const dependencyName = taskMap.get(dependencyId) ?? "Unknown task";
    if (seen.has(dependencyName)) {
      continue;
    }

    seen.add(dependencyName);
    dependencyNames.push(dependencyName);
  }

  return dependencyNames;
}
