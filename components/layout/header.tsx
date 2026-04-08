"use client";

import Link from "next/link";
import type { Route } from "next";
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
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[rgba(0,0,0,0.82)] backdrop-blur-[20px] backdrop-saturate-150">
      <div className="flex items-center gap-4 px-4 py-3 sm:px-6 lg:px-10">
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/6 text-white lg:hidden"
          onClick={() => setMobileOpen((value) => !value)}
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.24em] text-white/45">{workspaceName}</p>
          <p className="truncate text-[21px] font-semibold tracking-[-0.02em] text-white">Project Delivery Command Center</p>
        </div>
        <div className="hidden max-w-md flex-1 lg:block">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
            <Input className="border-white/10 bg-white/10 pl-11 text-white placeholder:text-white/35" placeholder="Search projects, tasks, or descriptions" />
          </div>
        </div>
        <div className="hidden items-center gap-3 sm:flex">
          <Button variant="secondary" onClick={() => router.push("/projects" as Route)}>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
          <Button onClick={() => router.push("/tasks" as Route)}>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/10 text-sm font-semibold text-white">
          {profile?.full_name
            ?.split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2) ?? "PM"}
        </div>
        <form action={logoutAction} className="hidden sm:block">
          <Button
            variant="ghost"
            size="sm"
            className="h-11 w-11 border border-white/10 bg-white/6 px-0 text-white hover:bg-white/10 hover:text-white"
            aria-label="Logout"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </div>
      {mobileOpen ? (
        <div className="space-y-3 border-t border-white/10 bg-black px-4 py-4 lg:hidden">
          <nav className="grid gap-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-3 text-sm font-medium ${
                  pathname.startsWith(item.href) ? "bg-white text-[#1d1d1f]" : "bg-white/6 text-white/72"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Input className="border-white/10 bg-white/10 text-white placeholder:text-white/35" placeholder="Search projects, tasks, or descriptions" />
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => router.push("/projects" as Route)}>
              New Project
            </Button>
            <Button className="flex-1" onClick={() => router.push("/tasks" as Route)}>
              New Task
            </Button>
          </div>
          <form action={logoutAction}>
            <Button
              variant="ghost"
              className="h-11 w-11 border border-white/10 bg-white/6 px-0 text-white hover:bg-white/10 hover:text-white"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
        </div>
      ) : null}
    </header>
  );
}
