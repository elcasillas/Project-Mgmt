import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import type { Profile } from "@/lib/types/domain";

export function AppShell({
  children,
  profile,
  workspaceName
}: {
  children: React.ReactNode;
  profile: Profile | null;
  workspaceName: string;
}) {
  return (
    <div className="flex min-h-screen bg-transparent">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header profile={profile} workspaceName={workspaceName} />
        <main className="flex-1 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
