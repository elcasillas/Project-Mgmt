import type { UserRole } from "@/lib/types/domain";

export function canManageWorkspace(role?: UserRole | null) {
  return role === "Admin";
}

export function canManageProjects(role?: UserRole | null) {
  return role === "Admin" || role === "Manager";
}

export function canManageTasks(role?: UserRole | null) {
  return role === "Admin" || role === "Manager" || role === "Member";
}
