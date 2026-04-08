import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

function normalizeRole(role: string | null | undefined) {
  switch (role) {
    case "Admin":
      return "Admin";
    case "Manager":
    case "Project Manager":
      return "Project Manager";
    case "Member":
    case "Team Member":
      return "Team Member";
    case "Viewer":
      return "Viewer";
    default:
      return "Team Member";
  }
}

function normalizeStatus(status: string | null | undefined) {
  switch (status) {
    case "Active":
    case "Inactive":
    case "Pending":
      return status;
    default:
      return "Active";
  }
}

export function buildProfilePayload(user: User) {
  const firstName =
    String(user.user_metadata?.first_name ?? "").trim() ||
    String(user.user_metadata?.full_name ?? "").trim().split(" ")[0] ||
    user.email?.split("@")[0] ||
    "User";
  const lastName = String(user.user_metadata?.last_name ?? "").trim();
  const fullName = `${firstName} ${lastName}`.trim();

  return {
    id: user.id,
    first_name: firstName,
    last_name: lastName,
    full_name: fullName || firstName,
    email: user.email ?? "",
    role: normalizeRole(user.user_metadata?.role),
    status: normalizeStatus(user.user_metadata?.status),
    last_active_at: new Date().toISOString(),
    deleted_at: null
  };
}

export async function ensureProfileForUser(user: User) {
  const adminClient = createAdminClient();
  const payload = buildProfilePayload(user);

  const { data, error } = await adminClient
    .from("profiles")
    .upsert(payload, { onConflict: "id" })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data;
}
