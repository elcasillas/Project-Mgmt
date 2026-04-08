import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="max-w-md rounded-[32px] border border-white/70 bg-white/95 p-10 text-center shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">Not Found</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">The page or project you requested does not exist.</h1>
        <p className="mt-3 text-sm text-slate-500">It may have been archived, removed, or the link may be outdated.</p>
        <div className="mt-6">
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-sky-600 px-4 text-sm font-medium text-white transition hover:bg-sky-700"
          >
            Return to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
