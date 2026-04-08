import Image from "next/image";
import Link from "next/link";
import logo from "@/casibros-white.png";
import { APP_NAME } from "@/lib/data/constants";

export function AuthShell({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-950 text-white">
      <div className="hidden flex-1 flex-col justify-between bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.35),_transparent_35%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)] p-12 lg:flex">
        <div>
          <Image src={logo} alt="Casibros" className="h-auto w-[180px]" priority />
          <h1 className="mt-8 max-w-md text-5xl font-semibold tracking-tight">Project execution with the clarity of an executive operating rhythm.</h1>
          <p className="mt-4 max-w-lg text-base text-slate-300">
            Plan, prioritize, and deliver work with live status tracking, collaboration, and portfolio-level visibility.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-300">Projects at risk surfaced early</p>
            <p className="mt-2 text-3xl font-semibold">7-day runway</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <p className="text-sm text-slate-300">Realtime collaboration</p>
            <p className="mt-2 text-3xl font-semibold">Always current</p>
          </div>
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-slate-900">
          <div className="mb-8">
            <Link href="/" className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">
              {APP_NAME}
            </Link>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">{title}</h2>
            <p className="mt-2 text-sm text-slate-500">{description}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
