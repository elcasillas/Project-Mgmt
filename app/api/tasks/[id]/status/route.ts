import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { status } = await request.json();

  const { error } = await supabase.from("tasks").update({ status }).eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await supabase.rpc("log_activity", {
    p_user_id: user.id,
    p_entity_type: "task",
    p_entity_id: id,
    p_action: "task_status_changed",
    p_metadata: { status }
  });

  return NextResponse.json({ ok: true });
}
