import type { Project, Task } from "@/lib/types/domain";

export function normalizeSearchQuery(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function includesQuery(value: string | null | undefined, query: string) {
  if (!query) {
    return false;
  }

  return normalizeSearchQuery(value).includes(query);
}

export function projectMatchesName(project: Project, query: string) {
  return includesQuery(project.name, query);
}

export function projectMatchesDescription(project: Project, query: string) {
  return includesQuery(project.description, query);
}

export function taskMatchesName(task: Task, query: string) {
  return includesQuery(task.title, query);
}

export function taskMatchesDescription(task: Task, query: string) {
  return includesQuery(task.description, query);
}
