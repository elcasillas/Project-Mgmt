"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderKanban, LayoutGrid, ListTodo, Settings, ShieldUser, Users } from "lucide-react";
import logo from "@/casibros-white.png";
import { NAV_ITEMS } from "@/lib/data/constants";
import { cn } from "@/lib/utils/cn";

const icons = {
  Dashboard: LayoutGrid,
  Projects: FolderKanban,
  Tasks: ListTodo,
  Users: ShieldUser,
  Team: Users,
  Settings: Settings
};

const navLinkBaseClass =
  "flex items-center gap-3 rounded-full px-4 py-3 text-[14px] tracking-[-0.01em] transition-colors";
const navLinkInactiveClass = "text-white/85 hover:bg-white/10 hover:text-white dark:text-gray-200 dark:hover:text-white";
const navLinkActiveClass = "bg-white text-black font-semibold dark:bg-white dark:text-black";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-[272px] shrink-0 flex-col border-r border-[rgba(255,255,255,0.08)] bg-[#000000] px-7 py-8 text-white lg:flex">
      <div className="mb-12 flex justify-center">
        <Image src={logo} alt="Casibros" className="h-auto w-[192px]" priority />
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
                navLinkBaseClass,
                active ? navLinkActiveClass : navLinkInactiveClass
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
