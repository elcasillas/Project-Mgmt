import Link from "next/link";
import { AuthShell } from "@/components/shared/auth-shell";
import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signupAction } from "@/lib/actions/auth";

export default async function SignupPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthShell title="Create account" description="Set up a workspace identity and get started with delivery planning.">
      <form action={signupAction} className="space-y-5">
        <FormField label="Full name" htmlFor="full_name">
          <Input id="full_name" name="full_name" required placeholder="Avery Stone" />
        </FormField>
        <FormField label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" required placeholder="you@company.com" />
        </FormField>
        <FormField label="Password" htmlFor="password" hint="Use at least 8 characters.">
          <Input id="password" name="password" type="password" required placeholder="Create a password" />
        </FormField>
        {params.error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{params.error}</p> : null}
        <Button className="w-full">Create account</Button>
      </form>
      <p className="mt-6 text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="text-sky-600 hover:text-sky-700">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
