import type { Task, TaskPurchaseItem } from "@/lib/types/domain";

export const TASK_WITH_RELATIONS_SELECT = `
  *,
  assignee:profiles!tasks_assignee_id_fkey(*),
  reporter:profiles!tasks_reporter_id_fkey(*),
  projects(id, name, status, priority, progress),
  task_dependencies!task_dependencies_task_id_fkey(depends_on_task_id)
`;

export function normalizeTaskPurchaseItems(value: unknown): TaskPurchaseItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (typeof item !== "object" || item === null) {
      return [];
    }

    const id = typeof item.id === "string" && item.id.trim() ? item.id.trim() : crypto.randomUUID();
    const name = typeof item.name === "string" ? item.name.trim() : "";
    if (!name) {
      return [];
    }

    return [{ id, name }];
  });
}

export function mapTaskRecord(row: any): Task {
  const rawPurchaseItems =
    Array.isArray(row.purchase_items) ? row.purchase_items : Array.isArray(row.purchaseItems) ? row.purchaseItems : [];

  return {
    id: row.id,
    project_id: row.project_id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    assignee_id: row.assignee_id,
    reporter_id: row.reporter_id,
    start_date: row.start_date,
    due_date: row.due_date,
    estimated_hours: row.estimated_hours,
    actual_hours: row.actual_hours,
    created_at: row.created_at,
    updated_at: row.updated_at,
    assignee: row.assignee
      ? {
          id: row.assignee.id,
          first_name: row.assignee.first_name ?? "",
          last_name: row.assignee.last_name ?? "",
          full_name: row.assignee.full_name,
          email: row.assignee.email,
          role: row.assignee.role,
          status: row.assignee.status ?? "Active",
          avatar_url: row.assignee.avatar_url,
          created_at: row.assignee.created_at,
          updated_at: row.assignee.updated_at,
          last_active_at: row.assignee.last_active_at ?? null,
          deleted_at: row.assignee.deleted_at ?? null
        }
      : null,
    reporter: row.reporter
      ? {
          id: row.reporter.id,
          first_name: row.reporter.first_name ?? "",
          last_name: row.reporter.last_name ?? "",
          full_name: row.reporter.full_name,
          email: row.reporter.email,
          role: row.reporter.role,
          status: row.reporter.status ?? "Active",
          avatar_url: row.reporter.avatar_url,
          created_at: row.reporter.created_at,
          updated_at: row.reporter.updated_at,
          last_active_at: row.reporter.last_active_at ?? null,
          deleted_at: row.reporter.deleted_at ?? null
        }
      : null,
    project: row.projects
      ? {
          id: row.projects.id,
          name: row.projects.name,
          status: row.projects.status,
          priority: row.projects.priority,
          progress: row.projects.progress
        }
      : null,
    dependency_ids: Array.isArray(row.task_dependencies)
      ? row.task_dependencies.map((entry: any) => entry.depends_on_task_id)
      : [],
    purchaseItems: normalizeTaskPurchaseItems(rawPurchaseItems)
  };
}
