import type { UserRole } from "@/lib/types/domain";

export function canManageWorkspace(role?: UserRole | null) {
  return role === "Admin";
}

export function canManageUsers(role?: UserRole | null) {
  return role === "Admin";
}

export function canViewUsers(role?: UserRole | null) {
  return role === "Admin" || role === "Project Manager" || role === "Team Member" || role === "Viewer";
}

export function canManageProjects(role?: UserRole | null) {
  return role === "Admin" || role === "Project Manager";
}

export function canManageTasks(role?: UserRole | null) {
  return role === "Admin" || role === "Project Manager" || role === "Team Member";
}
