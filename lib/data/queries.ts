import { createClient } from "@/lib/supabase/server";
import { isApproaching, isDueThisWeek, isOverdue } from "@/lib/utils/format";
import type {
  ActivityLog,
  Attachment,
  Comment,
  DashboardMetrics,
  Profile,
  Project,
  Task
} from "@/lib/types/domain";

function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack
    };
  }

  if (typeof error === "object" && error !== null) {
    return error;
  }

  return { message: String(error) };
}

function logQueryError(scope: string, error: unknown, metadata?: Record<string, unknown>) {
  console.error(`[queries] ${scope} failed`, {
    ...metadata,
    error: serializeError(error)
  });
}

function mapProfile(row: any): Profile {
  return {
    id: row.id,
    full_name: row.full_name,
    email: row.email,
    role: row.role,
    avatar_url: row.avatar_url,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

function mapProject(row: any): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    owner_id: row.owner_id,
    status: row.status,
    priority: row.priority,
    start_date: row.start_date,
    target_end_date: row.target_end_date,
    progress: row.progress,
    archived: row.archived,
    notes: row.notes,
    created_at: row.created_at,
    updated_at: row.updated_at,
    owner: row.owner ? mapProfile(row.owner) : undefined,
    members: Array.isArray(row.project_members)
      ? row.project_members
          .map((entry: any) => entry.profiles)
          .filter(Boolean)
          .map((profile: any) => mapProfile(profile))
      : [],
    tags: Array.isArray(row.project_tags)
      ? row.project_tags.map((entry: any) => entry.tags)
      : [],
    task_count: row.tasks?.[0]?.count ?? undefined,
    overdue_task_count: row.overdue_tasks?.[0]?.count ?? undefined
  };
}

function mapAttachment(row: any): Attachment {
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const fileUrl = baseUrl ? `${baseUrl}/storage/v1/object/public/attachments/${row.file_path}` : row.file_path;

  return {
    id: row.id,
    project_id: row.project_id,
    task_id: row.task_id,
    file_name: row.file_name,
    file_path: row.file_path,
    file_url: fileUrl,
    uploaded_by: row.uploaded_by,
    created_at: row.created_at,
    uploader: row.uploader ? mapProfile(row.uploader) : undefined
  };
}

function mapTask(row: any): Task {
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
    assignee: row.assignee ? mapProfile(row.assignee) : null,
    reporter: row.reporter ? mapProfile(row.reporter) : null,
    project: row.projects
      ? {
          id: row.projects.id,
          name: row.projects.name,
          status: row.projects.status,
          priority: row.projects.priority,
          progress: row.projects.progress
        }
      : null,
    tags: Array.isArray(row.task_tags) ? row.task_tags.map((entry: any) => entry.tags) : [],
    dependency_ids: Array.isArray(row.task_dependencies)
      ? row.task_dependencies.map((entry: any) => entry.depends_on_task_id)
      : []
  };
}

function mapActivity(row: any): ActivityLog {
  return {
    id: row.id,
    user_id: row.user_id,
    entity_type: row.entity_type,
    entity_id: row.entity_id,
    action: row.action,
    metadata: row.metadata,
    created_at: row.created_at,
    actor: row.actor ? mapProfile(row.actor) : undefined
  };
}

export async function getCurrentProfile() {
  try {
    const supabase = await createClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (error) {
      throw error;
    }

    return data ? mapProfile(data) : null;
  } catch (error) {
    logQueryError("getCurrentProfile", error);
    throw error;
  }
}

export async function getWorkspaceSettings() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from("workspace_settings").select("*").single();
    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    logQueryError("getWorkspaceSettings", error);
    throw error;
  }
}

export async function getProjects() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select(
        `
          *,
          owner:profiles!projects_owner_id_fkey(*),
          project_members(
            profiles(*)
          ),
          project_tags(
            tags(*)
          )
        `
      )
      .eq("archived", false)
      .order("updated_at", { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []).map(mapProject);
  } catch (error) {
    logQueryError("getProjects", error);
    throw error;
  }
}

export async function getProjectDetail(projectId: string) {
  try {
    const supabase = await createClient();
    const [projectResult, tasksResult, activityResult, commentsResult, attachmentsResult] = await Promise.all([
      supabase
        .from("projects")
        .select(
          `
            *,
            owner:profiles!projects_owner_id_fkey(*),
            project_members(
              profiles(*)
            ),
            project_tags(
              tags(*)
            )
          `
        )
        .eq("id", projectId)
        .single(),
      supabase
        .from("tasks")
        .select(
          `
            *,
            assignee:profiles!tasks_assignee_id_fkey(*),
            reporter:profiles!tasks_reporter_id_fkey(*),
            projects(id, name, status, priority, progress),
            task_tags(tags(*)),
            task_dependencies!task_dependencies_task_id_fkey(depends_on_task_id)
          `
        )
        .eq("project_id", projectId)
        .order("updated_at", { ascending: false }),
      supabase
        .from("activity_logs")
        .select("*, actor:profiles!activity_logs_user_id_fkey(*)")
        .eq("entity_id", projectId)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("comments")
        .select("*, author:profiles!comments_user_id_fkey(*)")
        .in(
          "task_id",
          (await supabase.from("tasks").select("id").eq("project_id", projectId)).data?.map((task) => task.id) ?? ["00000000-0000-0000-0000-000000000000"]
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("attachments")
        .select("*, uploader:profiles!attachments_uploaded_by_fkey(*)")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false })
    ]);

    if (projectResult.error) {
      throw projectResult.error;
    }

    return {
      project: mapProject(projectResult.data),
      tasks: (tasksResult.data ?? []).map(mapTask),
      activity: (activityResult.data ?? []).map(mapActivity),
      comments: (commentsResult.data ?? []).map((row: any) => ({
        id: row.id,
        task_id: row.task_id,
        user_id: row.user_id,
        body: row.body,
        created_at: row.created_at,
        author: row.author ? mapProfile(row.author) : undefined
      })) as Comment[],
      attachments: (attachmentsResult.data ?? []).map(mapAttachment)
    };
  } catch (error) {
    logQueryError("getProjectDetail", error, { projectId });
    throw error;
  }
}

export async function getTasks() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("tasks")
      .select(
        `
          *,
          assignee:profiles!tasks_assignee_id_fkey(*),
          reporter:profiles!tasks_reporter_id_fkey(*),
          projects(id, name, status, priority, progress),
          task_tags(tags(*)),
          task_dependencies!task_dependencies_task_id_fkey(depends_on_task_id)
        `
      )
      .order("updated_at", { ascending: false });

    if (error) {
      throw error;
    }

    return (data ?? []).map(mapTask);
  } catch (error) {
    logQueryError("getTasks", error);
    throw error;
  }
}

export async function getTaskDetail(taskId: string) {
  const supabase = await createClient();
  const [taskResult, commentsResult, attachmentsResult] = await Promise.all([
    supabase
      .from("tasks")
      .select(
        `
          *,
          assignee:profiles!tasks_assignee_id_fkey(*),
          reporter:profiles!tasks_reporter_id_fkey(*),
          projects(id, name, status, priority, progress),
          task_tags(tags(*)),
          task_dependencies!task_dependencies_task_id_fkey(depends_on_task_id)
        `
      )
      .eq("id", taskId)
      .single(),
    supabase
      .from("comments")
      .select("*, author:profiles!comments_user_id_fkey(*)")
      .eq("task_id", taskId)
      .order("created_at", { ascending: true }),
    supabase
      .from("attachments")
      .select("*, uploader:profiles!attachments_uploaded_by_fkey(*)")
      .eq("task_id", taskId)
      .order("created_at", { ascending: false })
  ]);

  if (taskResult.error) {
    throw taskResult.error;
  }

  return {
    task: mapTask(taskResult.data),
    comments: (commentsResult.data ?? []).map((row: any) => ({
      id: row.id,
      task_id: row.task_id,
      user_id: row.user_id,
      body: row.body,
      created_at: row.created_at,
      author: row.author ? mapProfile(row.author) : undefined
    })) as Comment[],
    attachments: (attachmentsResult.data ?? []).map(mapAttachment)
  };
}

export async function getTaskCommentsAndAttachments(taskIds: string[]) {
  if (!taskIds.length) {
    return { comments: [] as Comment[], attachments: [] as Attachment[] };
  }

  try {
    const supabase = await createClient();
    const [commentsResult, attachmentsResult] = await Promise.all([
      supabase
        .from("comments")
        .select("*, author:profiles!comments_user_id_fkey(*)")
        .in("task_id", taskIds)
        .order("created_at", { ascending: true }),
      supabase
        .from("attachments")
        .select("*, uploader:profiles!attachments_uploaded_by_fkey(*)")
        .in("task_id", taskIds)
        .order("created_at", { ascending: false })
    ]);

    return {
      comments: (commentsResult.data ?? []).map((row: any) => ({
        id: row.id,
        task_id: row.task_id,
        user_id: row.user_id,
        body: row.body,
        created_at: row.created_at,
        author: row.author ? mapProfile(row.author) : undefined
      })) as Comment[],
      attachments: (attachmentsResult.data ?? []).map(mapAttachment)
    };
  } catch (error) {
    logQueryError("getTaskCommentsAndAttachments", error, { taskIds });
    throw error;
  }
}

export async function getTeamMembers() {
  try {
    const supabase = await createClient();
    const [profilesResult, projectsResult, tasksResult] = await Promise.all([
      supabase.from("profiles").select("*").order("full_name"),
      supabase.from("project_members").select("user_id, project_id"),
      supabase.from("tasks").select("assignee_id, status")
    ]);

    const profiles = (profilesResult.data ?? []).map(mapProfile);
    const projectMemberships = projectsResult.data ?? [];
    const tasks = tasksResult.data ?? [];

    return profiles.map((profile) => ({
      ...profile,
      activeProjects: projectMemberships.filter((entry) => entry.user_id === profile.id).length,
      assignedTasks: tasks.filter((task) => task.assignee_id === profile.id).length,
      workloadSummary: tasks.filter((task) => task.assignee_id === profile.id && task.status !== "Done").length
    }));
  } catch (error) {
    logQueryError("getTeamMembers", error);
    throw error;
  }
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    const [projects, tasks, activity] = await Promise.all([getProjects(), getTasks(), getRecentActivity()]);

    const activeProjects = projects.filter((project) => project.status === "Active");
    const overdueTasks = tasks.filter((task) => isOverdue(task.due_date, task.status === "Done"));
    const dueThisWeek = tasks.filter((task) => isDueThisWeek(task.due_date) && task.status !== "Done");
    const atRisk = projects.filter(
      (project) =>
        (project.target_end_date && isApproaching(project.target_end_date) && project.progress < 60) ||
        tasks.some((task) => task.project_id === project.id && isOverdue(task.due_date, task.status === "Done"))
    );

    return {
      totalActiveProjects: activeProjects.length,
      totalTasks: tasks.length,
      tasksDueThisWeek: dueThisWeek.length,
      overdueTasks: overdueTasks.length,
      projectsAtRisk: atRisk.length,
      tasksByStatus: ["Not Started", "In Progress", "Blocked", "In Review", "Done"].map((status) => ({
        status,
        count: tasks.filter((task) => task.status === status).length
      })) as DashboardMetrics["tasksByStatus"],
      recentTasks: tasks.slice(0, 6),
      recentActivity: activity.slice(0, 8),
      spotlightProjects: atRisk.slice(0, 3)
    };
  } catch (error) {
    logQueryError("getDashboardMetrics", error);
    throw error;
  }
}

export async function getRecentActivity() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("activity_logs")
      .select("*, actor:profiles!activity_logs_user_id_fkey(*)")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      throw error;
    }

    return (data ?? []).map(mapActivity);
  } catch (error) {
    logQueryError("getRecentActivity", error);
    throw error;
  }
}
