"use server";
import { revalidatePath } from "next/cache";
import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildProfilePayload } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";
import type { UserRole, UserStatus } from "@/lib/types/domain";

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string) {
  return password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password);
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

async function upsertManagedProfile(
  adminClient: ReturnType<typeof createAdminClient>,
  user: Pick<User, "id" | "email" | "user_metadata">,
  input: { firstName: string; lastName: string; role: UserRole; status: UserStatus; last_active_at: string | null }
) {
  const base = buildProfilePayload(user as User);
  const fullName = `${input.firstName} ${input.lastName}`.trim();

  const { error } = await adminClient.from("profiles").upsert(
    {
      ...base,
      first_name: input.firstName,
      last_name: input.lastName,
      full_name: fullName,
      email: user.email ?? "",
      role: input.role,
      status: input.status,
      last_active_at: input.last_active_at,
      deleted_at: null
    },
    { onConflict: "id" }
  );

  if (error) {
    throw error;
  }
}

async function findAuthUserByEmail(adminClient: ReturnType<typeof createAdminClient>, email: string) {
  let page = 1;

  while (page <= 10) {
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage: 200 });

    if (error) {
      throw error;
    }

    const matchedUser = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
    if (matchedUser) {
      return matchedUser;
    }

    if (data.users.length < 200) {
      break;
    }

    page += 1;
  }

  return null;
}

export async function saveUserAction(input: {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  password?: string;
}) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return auth;
  }

  const firstName = input.first_name.trim();
  const lastName = input.last_name.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password?.trim() ?? "";

  if (!firstName || !lastName || !email || !input.role || !input.status) {
    return { ok: false as const, message: "All fields are required." };
  }

  if (!validateEmail(email)) {
    return { ok: false as const, message: "Enter a valid email address." };
  }

  if (!input.id && !password) {
    return { ok: false as const, message: "Password is required for new users." };
  }

  if (password && !validatePassword(password)) {
    return {
      ok: false as const,
      message: "Password must be at least 8 characters and include uppercase, lowercase, and a number."
    };
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
    const { error: authError } = await adminClient.auth.admin.updateUserById(input.id, {
      email,
      ...(password ? { password } : {}),
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

    try {
      await upsertManagedProfile(
        adminClient,
        {
          id: input.id,
          email,
          user_metadata: {
            first_name: firstName,
            last_name: lastName,
            full_name: fullName,
            role: input.role,
            status: input.status
          }
        },
        {
          firstName,
          lastName,
          role: input.role,
          status: input.status,
          last_active_at: null
        }
      );
    } catch (profileError) {
      return { ok: false as const, message: profileError instanceof Error ? profileError.message : "Unable to update profile." };
    }

    revalidatePath("/users");
    return { ok: true as const, message: "User updated." };
  }

  const fullName = `${firstName} ${lastName}`.trim();
  const { data: createdUser, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      first_name: firstName,
      last_name: lastName,
      full_name: fullName,
      role: input.role,
      status: input.status
    }
  });

  const createdAuthUser = createdUser.user;

  if (createError || !createdAuthUser) {
    if (createError?.message?.toLowerCase().includes("already been registered")) {
      try {
        const existingAuthUser = await findAuthUserByEmail(adminClient, email);

        if (existingAuthUser) {
          const { error: authUpdateError } = await adminClient.auth.admin.updateUserById(existingAuthUser.id, {
            email,
            ...(password ? { password } : {}),
            user_metadata: {
              first_name: firstName,
              last_name: lastName,
              full_name: fullName,
              role: input.role,
              status: input.status
            }
          });

          if (authUpdateError) {
            return { ok: false as const, message: authUpdateError.message };
          }

          await upsertManagedProfile(adminClient, existingAuthUser, {
            firstName,
            lastName,
            role: input.role,
            status: input.status,
            last_active_at: null
          });

          revalidatePath("/users");
          return { ok: true as const, message: "Existing auth user recovered and added to the directory." };
        }
      } catch (recoveryError) {
        return {
          ok: false as const,
          message: recoveryError instanceof Error ? recoveryError.message : "Unable to recover existing user."
        };
      }
    }

    return { ok: false as const, message: createError?.message || "Unable to create user." };
  }

  try {
    await upsertManagedProfile(adminClient, createdAuthUser, {
      firstName,
      lastName,
      role: input.role,
      status: input.status,
      last_active_at: null
    });
  } catch (profileError) {
    return { ok: false as const, message: profileError instanceof Error ? profileError.message : "Unable to create profile." };
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
