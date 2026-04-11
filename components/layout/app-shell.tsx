import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import type { Profile, Project, Task } from "@/lib/types/domain";

export function AppShell({
  children,
  profile,
  workspaceName,
  projects,
  tasks
}: {
  children: React.ReactNode;
  profile: Profile | null;
  workspaceName: string;
  projects: Project[];
  tasks: Task[];
}) {
  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]">
      <Sidebar />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col lg:pl-[272px]">
        <Header profile={profile} workspaceName={workspaceName} projects={projects} tasks={tasks} />
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
