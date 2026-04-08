"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, Menu, Plus, Search } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NAV_ITEMS } from "@/lib/data/constants";
import type { Profile } from "@/lib/types/domain";

export function Header({
  profile,
  workspaceName
}: {
  profile: Profile | null;
  workspaceName: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 border-b border-white/70 bg-slate-100/80 backdrop-blur">
      <div className="flex items-center gap-4 px-4 py-4 lg:px-8">
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white lg:hidden"
          onClick={() => setMobileOpen((value) => !value)}
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">{workspaceName}</p>
          <p className="truncate text-lg font-semibold text-slate-950">Project Delivery Command Center</p>
        </div>
        <div className="hidden max-w-md flex-1 lg:block">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="pl-11" placeholder="Search projects, tasks, or descriptions" />
          </div>
        </div>
        <div className="hidden items-center gap-3 sm:flex">
          <Button variant="secondary" onClick={() => router.push("/projects")}>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
          <Button onClick={() => router.push("/tasks")}>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
          {profile?.full_name
            ?.split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2) ?? "PM"}
        </div>
        <form action={logoutAction} className="hidden sm:block">
          <Button variant="ghost" size="sm">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </form>
      </div>
      {mobileOpen ? (
        <div className="space-y-3 border-t border-white/70 bg-white px-4 py-4 lg:hidden">
          <nav className="grid gap-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-2xl px-4 py-3 text-sm font-medium ${
                  pathname.startsWith(item.href) ? "bg-sky-50 text-sky-700" : "bg-slate-50 text-slate-700"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Input placeholder="Search projects, tasks, or descriptions" />
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => router.push("/projects")}>
              New Project
            </Button>
            <Button className="flex-1" onClick={() => router.push("/tasks")}>
              New Task
            </Button>
          </div>
          <form action={logoutAction}>
            <Button variant="ghost" className="w-full">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </form>
        </div>
      ) : null}
    </header>
  );
}
