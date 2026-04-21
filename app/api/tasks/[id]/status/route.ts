import { NextResponse } from "next/server";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/lib/data/constants";
import { createClient } from "@/lib/supabase/server";
import type { TaskPriority, TaskStatus } from "@/lib/types/domain";

type QuickUpdateField = "status" | "priority";

function parseTaskUpdate(payload: unknown): { field: "status"; value: TaskStatus } | { field: "priority"; value: TaskPriority } | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const body = payload as { field?: QuickUpdateField; value?: string; status?: string; priority?: string };
  const field = body.field ?? (body.priority ? "priority" : "status");
  const value = body.value ?? (field === "priority" ? body.priority : body.status);

  if (field === "status" && TASK_STATUSES.includes(value as TaskStatus)) {
    return { field, value: value as TaskStatus };
  }

  if (field === "priority" && TASK_PRIORITIES.includes(value as TaskPriority)) {
    return { field, value: value as TaskPriority };
  }

  return null;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const update = parseTaskUpdate(await request.json());

  if (!update) {
    return NextResponse.json({ error: "Invalid task update." }, { status: 400 });
  }

  const { error } = await supabase.from("tasks").update({ [update.field]: update.value }).eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await supabase.rpc("log_activity", {
    p_user_id: user.id,
    p_entity_type: "task",
    p_entity_id: id,
    p_action: update.field === "status" ? "task_status_changed" : "task_priority_changed",
    p_metadata: { [update.field]: update.value }
  });

  return NextResponse.json({ ok: true });
}
