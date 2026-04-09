import Link from "next/link";
import { AuthShell } from "@/components/shared/auth-shell";
import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginAction } from "@/lib/actions/auth";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthShell
      title="Sign in"
      description="Access your project portfolio, task boards, and team workspace."
      heroTitle="Project Execution Platform"
    >
      <form action={loginAction} className="space-y-5">
        <FormField label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" required placeholder="you@company.com" />
        </FormField>
        <FormField label="Password" htmlFor="password">
          <Input id="password" name="password" type="password" required placeholder="Enter your password" />
        </FormField>
        {params.error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{params.error}</p> : null}
        {params.message ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{params.message}</p> : null}
        <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Account access is managed by your administrator. Contact your admin if you need a new account.
        </p>
        <Button className="w-full">Sign in</Button>
      </form>
      <div className="mt-6 flex items-center justify-start text-sm text-slate-500">
        <Link href="/forgot-password" className="text-sky-600 hover:text-sky-700">
          Forgot password?
        </Link>
      </div>
    </AuthShell>
  );
}
