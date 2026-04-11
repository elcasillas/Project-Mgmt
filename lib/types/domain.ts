export type UserRole = "Admin" | "Project Manager" | "Team Member" | "Viewer";
export type UserStatus = "Active" | "Inactive" | "Pending";
export type ProjectStatus = "Planning" | "Active" | "On Hold" | "Completed" | "Cancelled";
export type ProjectPriority = "Low" | "Medium" | "High" | "Critical";
export type TaskStatus = "Not Started" | "In Progress" | "Blocked" | "In Review" | "Done";
export type TaskPriority = "Low" | "Medium" | "High" | "Urgent";

export type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  last_active_at: string | null;
  deleted_at: string | null;
};

export type Project = {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  start_date: string | null;
  target_end_date: string | null;
  progress: number;
  archived: boolean;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  owner?: Profile;
  members?: Profile[];
  task_count?: number;
  overdue_task_count?: number;
};

export type Task = {
  id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assignee_id: string | null;
  reporter_id: string | null;
  start_date: string | null;
  due_date: string | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  created_at: string;
  updated_at: string;
  assignee?: Profile | null;
  reporter?: Profile | null;
  project?: Pick<Project, "id" | "name" | "status" | "priority" | "progress"> | null;
  dependency_ids?: string[];
};

export type Comment = {
  id: string;
  task_id: string;
  user_id: string;
  body: string;
  created_at: string;
  author?: Profile;
};

export type Attachment = {
  id: string;
  project_id: string | null;
  task_id: string | null;
  file_name: string;
  file_path: string;
  file_url?: string;
  uploaded_by: string;
  created_at: string;
  uploader?: Profile;
};

export type ActivityLog = {
  id: string;
  user_id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  actor?: Profile;
};

export type DashboardMetrics = {
  totalActiveProjects: number;
  totalTasks: number;
  tasksDueThisWeek: number;
  overdueTasks: number;
  projectsAtRisk: number;
  tasksByStatus: Array<{ status: TaskStatus; count: number }>;
  recentTasks: Task[];
  recentActivity: ActivityLog[];
  spotlightProjects: Project[];
};

export type UserDirectoryEntry = Profile & {
  assignedProjects: number;
  assignedTasks: number;
};
