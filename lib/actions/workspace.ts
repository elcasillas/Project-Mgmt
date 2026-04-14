"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { mapTaskRecord, normalizeTaskPurchaseItems, TASK_WITH_RELATIONS_SELECT } from "@/lib/data/task-record";
import { createClient } from "@/lib/supabase/server";

function splitCsv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseTaskPurchaseItems(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  try {
    return normalizeTaskPurchaseItems(JSON.parse(value));
  } catch {
    return [];
  }
}

async function requireViewer() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return { supabase, user };
}

async function getCurrentUserRole() {
  const { supabase, user } = await requireViewer();
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return { supabase, user, role: profile?.role ?? "Team Member" };
}

export async function saveProjectAction(formData: FormData) {
  const { supabase, user, role } = await getCurrentUserRole();
  if (role !== "Admin" && role !== "Project Manager") {
    return {
      ok: false,
      message: "Only Admins and Managers can create or edit projects."
    };
  }

  const projectId = String(formData.get("id") || "");
  const payload = {
    name: String(formData.get("name") || ""),
    description: String(formData.get("description") || "") || null,
    owner_id: String(formData.get("owner_id") || user.id),
    status: String(formData.get("status") || "Planning"),
    priority: String(formData.get("priority") || "Medium"),
    start_date: String(formData.get("start_date") || "") || null,
    target_end_date: String(formData.get("target_end_date") || "") || null,
    notes: String(formData.get("notes") || "") || null
  };

  let savedProjectId = projectId;

  if (projectId) {
    const { error } = await supabase.from("projects").update(payload).eq("id", projectId);
    if (error) {
      return { ok: false, message: error.message };
    }
    await supabase.rpc("log_activity", {
      p_user_id: user.id,
      p_entity_type: "project",
      p_entity_id: projectId,
      p_action: "project_updated",
      p_metadata: { projectName: payload.name }
    });
  } else {
    const { data, error } = await supabase.from("projects").insert(payload).select("id").single();
    if (error || !data) {
      return { ok: false, message: error?.message || "Unable to create project" };
    }
    savedProjectId = data.id;
    await supabase.rpc("log_activity", {
      p_user_id: user.id,
      p_entity_type: "project",
      p_entity_id: savedProjectId,
      p_action: "project_created",
      p_metadata: { projectName: payload.name }
    });
  }

  const memberIds = splitCsv(String(formData.get("team_members") || ""));
  if (savedProjectId) {
    await supabase.from("project_members").delete().eq("project_id", savedProjectId);
    const uniqueMemberIds = Array.from(new Set([payload.owner_id, ...memberIds]));
    if (uniqueMemberIds.length) {
      await supabase.from("project_members").insert(uniqueMemberIds.map((memberId) => ({ project_id: savedProjectId, user_id: memberId })));
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/projects");
  if (savedProjectId) {
    revalidatePath(`/projects/${savedProjectId}`);
  }
  return {
    ok: true,
    message: projectId ? "Project updated." : "Project created."
  };
}

export async function archiveProjectAction(formData: FormData) {
  const { supabase, user, role } = await getCurrentUserRole();
  if (role !== "Admin" && role !== "Project Manager") {
    redirect("/projects?error=Only+Admins+and+Managers+can+archive+projects.");
  }

  const projectId = String(formData.get("project_id") || "");

  const { error } = await supabase.from("projects").update({ archived: true }).eq("id", projectId);
  if (error) {
    redirect(`/projects?error=${encodeURIComponent(error.message)}`);
  }

  await supabase.rpc("log_activity", {
    p_user_id: user.id,
    p_entity_type: "project",
    p_entity_id: projectId,
    p_action: "project_archived",
    p_metadata: {}
  });

  revalidatePath("/projects");
  revalidatePath("/dashboard");
  redirect("/projects?success=Project archived.");
}

export async function saveTaskAction(formData: FormData) {
  const { supabase, user } = await requireViewer();
  const taskId = String(formData.get("id") || "");
  const rawPurchaseItems = formData.get("purchase_items");
  const purchaseItems = parseTaskPurchaseItems(rawPurchaseItems);
  if (process.env.NODE_ENV !== "production") {
    console.info("[saveTaskAction] purchaseItems before save", { taskId, rawPurchaseItems, purchaseItems });
  }
  const payload = {
    project_id: String(formData.get("project_id") || "") || null,
    title: String(formData.get("title") || ""),
    description: String(formData.get("description") || "") || null,
    status: String(formData.get("status") || "Not Started"),
    priority: String(formData.get("priority") || "Medium"),
    assignee_id: String(formData.get("assignee_id") || "") || null,
    reporter_id: String(formData.get("reporter_id") || user.id) || null,
    start_date: String(formData.get("start_date") || "") || null,
    due_date: String(formData.get("due_date") || "") || null,
    estimated_hours: Number(formData.get("estimated_hours") || 0) || null,
    actual_hours: Number(formData.get("actual_hours") || 0) || null,
    purchase_items: purchaseItems
  };

  let savedTaskId = taskId;

  if (taskId) {
    const { error } = await supabase.from("tasks").update(payload).eq("id", taskId);
    if (error) {
      return { ok: false, message: error.message };
    }
    await supabase.rpc("log_activity", {
      p_user_id: user.id,
      p_entity_type: "task",
      p_entity_id: taskId,
      p_action: "task_updated",
      p_metadata: { title: payload.title, status: payload.status }
    });
  } else {
    const { data, error } = await supabase.from("tasks").insert(payload).select("id").single();
    if (error || !data) {
      return { ok: false, message: error?.message || "Unable to create task" };
    }
    savedTaskId = data.id;
    await supabase.rpc("log_activity", {
      p_user_id: user.id,
      p_entity_type: "task",
      p_entity_id: savedTaskId,
      p_action: "task_created",
      p_metadata: { title: payload.title }
    });
  }

  const dependencyIds = splitCsv(String(formData.get("dependency_ids") || ""));
  if (savedTaskId) {
    await supabase.from("task_dependencies").delete().eq("task_id", savedTaskId);
    if (dependencyIds.length) {
      await supabase
        .from("task_dependencies")
        .insert(dependencyIds.map((dependsOnTaskId) => ({ task_id: savedTaskId, depends_on_task_id: dependsOnTaskId })));
    }
  }

  const { data: savedTaskRow, error: savedTaskError } = await supabase
    .from("tasks")
    .select(TASK_WITH_RELATIONS_SELECT)
    .eq("id", savedTaskId)
    .single();

  if (savedTaskError || !savedTaskRow) {
    return {
      ok: false,
      message: savedTaskError?.message || "Task saved, but the updated task could not be reloaded."
    };
  }

  const savedTask = mapTaskRecord(savedTaskRow);
  if (process.env.NODE_ENV !== "production") {
    console.info("[saveTaskAction] saved task after reload", { taskId: savedTaskId, payload, savedTaskRow, savedTask });
  }

  revalidatePath("/dashboard");
  revalidatePath("/tasks");
  if (payload.project_id) {
    revalidatePath(`/projects/${payload.project_id}`);
  }
  return {
    ok: true,
    message: taskId ? "Task updated." : "Task created.",
    task: savedTask
  };
}

export async function updateTaskStatusAction(formData: FormData) {
  const { supabase, user } = await requireViewer();
  const taskId = String(formData.get("task_id") || "");
  const status = String(formData.get("status") || "");

  const { error } = await supabase.from("tasks").update({ status }).eq("id", taskId);
  if (error) {
    redirect(`/tasks?error=${encodeURIComponent(error.message)}`);
  }

  await supabase.rpc("log_activity", {
    p_user_id: user.id,
    p_entity_type: "task",
    p_entity_id: taskId,
    p_action: "task_status_changed",
    p_metadata: { status }
  });

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function deleteTaskAction(formData: FormData) {
  const { supabase, user } = await requireViewer();
  const taskId = String(formData.get("task_id") || "");

  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  if (error) {
    redirect(`/tasks?error=${encodeURIComponent(error.message)}`);
  }

  await supabase.rpc("log_activity", {
    p_user_id: user.id,
    p_entity_type: "task",
    p_entity_id: taskId,
    p_action: "task_deleted",
    p_metadata: {}
  });

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function addCommentAction(formData: FormData) {
  const { supabase, user } = await requireViewer();
  const taskId = String(formData.get("task_id") || "");
  const projectId = String(formData.get("project_id") || "");
  const body = String(formData.get("body") || "");

  const { error } = await supabase.from("comments").insert({ task_id: taskId, user_id: user.id, body });
  if (error) {
    redirect(`/tasks?error=${encodeURIComponent(error.message)}`);
  }

  await supabase.rpc("log_activity", {
    p_user_id: user.id,
    p_entity_type: "task",
    p_entity_id: taskId,
    p_action: "comment_added",
    p_metadata: { body }
  });

  revalidatePath("/tasks");
  if (projectId) {
    revalidatePath(`/projects/${projectId}`);
  }
}

export async function deleteAttachmentAction(formData: FormData) {
  const { supabase } = await requireViewer();
  const attachmentId = String(formData.get("attachment_id") || "");
  const filePath = String(formData.get("file_path") || "");
  const projectId = String(formData.get("project_id") || "");

  if (filePath) {
    await supabase.storage.from("attachments").remove([filePath]);
  }

  const { error } = await supabase.from("attachments").delete().eq("id", attachmentId);
  if (error) {
    redirect(`/tasks?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/tasks");
  if (projectId) {
    revalidatePath(`/projects/${projectId}`);
  }
}

export async function updateProfileAction(formData: FormData) {
  const { supabase, user } = await requireViewer();
  const fullName = String(formData.get("full_name") || "");
  const avatarUrl = String(formData.get("avatar_url") || "") || null;

  const { error } = await supabase.from("profiles").update({ full_name: fullName, avatar_url: avatarUrl }).eq("id", user.id);
  if (error) {
    redirect(`/settings?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
}

export async function updateWorkspaceSettingsAction(formData: FormData) {
  const { supabase } = await requireViewer();
  const payload = {
    workspace_name: String(formData.get("workspace_name") || "Northstar PM"),
    default_project_status: String(formData.get("default_project_status") || "Planning"),
    default_project_priority: String(formData.get("default_project_priority") || "Medium"),
    notifications_enabled: String(formData.get("notifications_enabled") || "off") === "on"
  };

  const { data: current } = await supabase.from("workspace_settings").select("id").single();
  if (!current?.id) {
    redirect("/settings?error=Workspace settings record not found.");
  }

  const { error } = await supabase.from("workspace_settings").update(payload).eq("id", current.id);
  if (error) {
    redirect(`/settings?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
}
