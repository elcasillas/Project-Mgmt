import Link from "next/link";
import { AuthShell } from "@/components/shared/auth-shell";

export default async function SignupPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const params = await searchParams;

  return (
    <AuthShell title="Account creation" description="Account creation is managed by your administrator.">
      <div className="space-y-5">
        {params.error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{params.error}</p> : null}
        {params.message ? <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{params.message}</p> : null}
        <p className="rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
          Account creation is managed by your administrator. Contact your admin if you need access to the workspace.
        </p>
      </div>
      <p className="mt-6 text-sm text-slate-500">
        Return to{" "}
        <Link href="/login" className="text-sky-600 hover:text-sky-700">
          sign in
        </Link>
      </p>
    </AuthShell>
  );
}
