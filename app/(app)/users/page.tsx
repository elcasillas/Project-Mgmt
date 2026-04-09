import { PageHeader } from "@/components/shared/page-header";
import { UsersView } from "@/components/users/users-view";
import { Card } from "@/components/ui/card";
import { getCurrentProfile, getUsersDirectory } from "@/lib/data/queries";
import { canManageUsers, canViewUsers } from "@/lib/utils/permissions";

export default async function UsersPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const params = await searchParams;
  const [currentProfile, users] = await Promise.all([getCurrentProfile(), getUsersDirectory()]);

  if (!canViewUsers(currentProfile?.role)) {
    return (
      <div className="space-y-8">
        <PageHeader eyebrow="Workspace" title="Users" description="User directory access is restricted for your current role." />
        <Card className="border-rose-200 bg-rose-50 text-rose-800">
          <p className="text-sm font-medium">You do not have permission to view the user directory.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Workspace"
        title="Users"
        description="Manage workspace access, roles, and account lifecycle controls for your team."
      />
      {params.error ? (
        <Card className="border-rose-200 bg-rose-50 text-rose-800">
          <p className="text-sm font-medium">{params.error}</p>
        </Card>
      ) : null}
      {params.success ? (
        <Card className="border-emerald-200 bg-emerald-50 text-emerald-800">
          <p className="text-sm font-medium">{params.success}</p>
        </Card>
      ) : null}
      <UsersView users={users} canManageUsers={canManageUsers(currentProfile?.role)} />
    </div>
  );
}
