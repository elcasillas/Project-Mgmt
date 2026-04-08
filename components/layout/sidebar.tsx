"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, FolderKanban, LayoutGrid, ListTodo, Settings, ShieldUser, Users } from "lucide-react";
import { APP_NAME, NAV_ITEMS } from "@/lib/data/constants";
import { cn } from "@/lib/utils/cn";

const icons = {
  Dashboard: LayoutGrid,
  Projects: FolderKanban,
  Tasks: ListTodo,
  Users: ShieldUser,
  Team: Users,
  Settings: Settings
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 shrink-0 flex-col border-r border-white/70 bg-slate-950 px-6 py-8 text-white lg:flex">
      <div className="mb-10 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-teal-500 text-lg font-bold">
          N
        </div>
        <div>
          <p className="text-lg font-semibold">{APP_NAME}</p>
          <p className="text-sm text-slate-400">Execution workspace</p>
        </div>
      </div>

      <nav className="space-y-2">
        {NAV_ITEMS.map((item) => {
          const Icon = icons[item.label as keyof typeof icons];
          const active = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                active ? "bg-white text-slate-950 shadow-lg" : "text-slate-300 hover:bg-slate-900 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-3xl bg-white/10 p-5">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-400/15 text-teal-200">
          <Bell className="h-5 w-5" />
        </div>
        <p className="text-sm font-semibold">Operational pulse</p>
        <p className="mt-1 text-sm text-slate-300">Live project and task updates flow in through Supabase Realtime subscriptions.</p>
      </div>
    </aside>
  );
}
