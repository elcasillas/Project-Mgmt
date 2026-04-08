"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { UserRole, UserStatus } from "@/lib/types/domain";

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false as const, message: "You must be signed in." };
  }

  const { data: profile } = await supabase.from("profiles").select("id, role").eq("id", user.id).single();
  if (!profile || profile.role !== "Admin") {
    return { ok: false as const, message: "Only admins can manage users." };
  }

  return { ok: true as const, userId: user.id };
}

async function getActiveAdminCount(adminClient: ReturnType<typeof createAdminClient>) {
  const { count } = await adminClient
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "Admin")
    .eq("status", "Active")
    .is("deleted_at", null);

  return count ?? 0;
}

export async function saveUserAction(input: {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
}) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return auth;
  }

  const firstName = input.first_name.trim();
  const lastName = input.last_name.trim();
  const email = input.email.trim().toLowerCase();

  if (!firstName || !lastName || !email || !input.role || !input.status) {
    return { ok: false as const, message: "All fields are required." };
  }

  if (!validateEmail(email)) {
    return { ok: false as const, message: "Enter a valid email address." };
  }

  const adminClient = createAdminClient();
  const { data: duplicate } = await adminClient
    .from("profiles")
    .select("id")
    .eq("email", email)
    .is("deleted_at", null)
    .neq("id", input.id ?? "00000000-0000-0000-0000-000000000000")
    .maybeSingle();

  if (duplicate) {
    return { ok: false as const, message: "A user with that email already exists." };
  }

  if (input.id) {
    const { data: existing } = await adminClient.from("profiles").select("role, status").eq("id", input.id).single();
    const activeAdminCount = await getActiveAdminCount(adminClient);

    if (
      existing?.role === "Admin" &&
      activeAdminCount <= 1 &&
      (input.role !== "Admin" || input.status !== "Active")
    ) {
      return { ok: false as const, message: "You cannot demote or deactivate the last remaining admin." };
    }

    const fullName = `${firstName} ${lastName}`.trim();
    const { error: profileError } = await adminClient
      .from("profiles")
      .update({
        first_name: firstName,
        last_name: lastName,
        full_name: fullName,
        email,
        role: input.role,
        status: input.status,
        deleted_at: null
      })
      .eq("id", input.id);

    if (profileError) {
      return { ok: false as const, message: profileError.message };
    }

    const { error: authError } = await adminClient.auth.admin.updateUserById(input.id, {
      email,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        full_name: fullName,
        role: input.role,
        status: input.status
      }
    });

    if (authError) {
      return { ok: false as const, message: authError.message };
    }

    revalidatePath("/users");
    return { ok: true as const, message: "User updated." };
  }

  const fullName = `${firstName} ${lastName}`.trim();
  const tempPassword = `${randomUUID()}Aa1!`;
  const { data: createdUser, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: {
      first_name: firstName,
      last_name: lastName,
      full_name: fullName,
      role: input.role,
      status: input.status
    }
  });

  if (createError || !createdUser.user) {
    return { ok: false as const, message: createError?.message || "Unable to create user." };
  }

  const { error: profileError } = await adminClient
    .from("profiles")
    .update({
      first_name: firstName,
      last_name: lastName,
      full_name: fullName,
      role: input.role,
      status: input.status,
      last_active_at: null,
      deleted_at: null
    })
    .eq("id", createdUser.user.id);

  if (profileError) {
    return { ok: false as const, message: profileError.message };
  }

  revalidatePath("/users");
  return { ok: true as const, message: "User created." };
}

export async function removeUserAction(input: { id: string }) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return auth;
  }

  if (input.id === auth.userId) {
    return { ok: false as const, message: "You cannot remove your own account." };
  }

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("profiles")
    .select("id, role, full_name")
    .eq("id", input.id)
    .single();

  if (!profile) {
    return { ok: false as const, message: "User not found." };
  }

  const activeAdminCount = await getActiveAdminCount(adminClient);
  if (profile.role === "Admin" && activeAdminCount <= 1) {
    return { ok: false as const, message: "You cannot remove the last remaining admin." };
  }

  const { error } = await adminClient
    .from("profiles")
    .update({
      status: "Inactive",
      deleted_at: new Date().toISOString()
    })
    .eq("id", input.id);

  if (error) {
    return { ok: false as const, message: error.message };
  }

  revalidatePath("/users");
  return { ok: true as const, message: `${profile.full_name} has been deactivated and removed from active views.` };
}
