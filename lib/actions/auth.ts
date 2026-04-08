"use server";

import { redirect } from "next/navigation";
import { ensureProfileForUser } from "@/lib/supabase/profiles";
import { createClient } from "@/lib/supabase/server";

export async function loginAction(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  const {
    data: { user },
    error
  } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  if (user) {
    await ensureProfileForUser(user);
  }

  redirect("/dashboard");
}

export async function signupAction(formData: FormData) {
  const supabase = await createClient();
  const fullName = String(formData.get("full_name") || "");
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        first_name: fullName.split(" ")[0] ?? fullName,
        last_name: fullName.split(" ").slice(1).join(" "),
        role: "Team Member",
        status: "Active"
      }
    }
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/login?message=Check your email to verify your account.");
}

export async function forgotPasswordAction(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") || "");
  const origin = String(formData.get("origin") || "");

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/settings`
  });

  if (error) {
    redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/forgot-password?message=Recovery link sent.");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
