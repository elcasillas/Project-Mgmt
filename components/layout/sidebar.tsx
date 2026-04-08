"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, FolderKanban, LayoutGrid, ListTodo, Settings, ShieldUser, Users } from "lucide-react";
import logo from "@/casibros-white.png";
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
    <aside className="fixed inset-y-0 left-0 hidden w-[272px] shrink-0 flex-col border-r border-[rgba(255,255,255,0.08)] bg-[#000000] px-7 py-8 text-white lg:flex">
      <div className="mb-12 flex items-center gap-4">
        <Image src={logo} alt="Casibros" className="h-auto w-[140px]" priority />
        <div>
          <p className="text-[21px] font-semibold tracking-[-0.02em] text-white">{APP_NAME}</p>
          <p className="text-[12px] uppercase tracking-[0.16em] text-white/45">Delivery system</p>
        </div>
      </div>

      <nav className="space-y-1.5">
        {NAV_ITEMS.map((item) => {
          const Icon = icons[item.label as keyof typeof icons];
          const active = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-full px-4 py-3 text-[14px] tracking-[-0.01em] transition",
                active ? "bg-white text-[#1d1d1f]" : "text-white/70 hover:bg-white/8 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-[8px] bg-[#1d1d1f] p-5">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/8 text-[#2997ff]">
          <Bell className="h-5 w-5" />
        </div>
        <p className="text-[17px] font-semibold tracking-[-0.02em] text-white">Operational pulse</p>
        <p className="mt-2 text-[14px] leading-[1.43] tracking-[-0.01em] text-white/62">
          Live project and task updates stream through the workspace in real time.
        </p>
      </div>
    </aside>
  );
}
