import type { Route } from "next";
import type { ProjectPriority, ProjectStatus, TaskPriority, TaskStatus, UserRole } from "@/lib/types/domain";

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Northstar PM";

export const USER_ROLES: UserRole[] = ["Admin", "Manager", "Member"];
export const PROJECT_STATUSES: ProjectStatus[] = ["Planning", "Active", "On Hold", "Completed", "Cancelled"];
export const PROJECT_PRIORITIES: ProjectPriority[] = ["Low", "Medium", "High", "Critical"];
export const TASK_STATUSES: TaskStatus[] = ["Not Started", "In Progress", "Blocked", "In Review", "Done"];
export const TASK_PRIORITIES: TaskPriority[] = ["Low", "Medium", "High", "Urgent"];

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/tasks", label: "Tasks" },
  { href: "/team", label: "Team" },
  { href: "/settings", label: "Settings" }
] as Array<{ href: Route; label: string }>;
