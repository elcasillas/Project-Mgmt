"use client";

import { useMemo, useState } from "react";
import { UserFormModal } from "@/components/users/user-form-modal";
import { UserDetailModal } from "@/components/users/user-detail-modal";
import { RemoveUserModal } from "@/components/users/remove-user-modal";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatDate } from "@/lib/utils/format";
import type { UserDirectoryEntry } from "@/lib/types/domain";

export function UsersView({
  users,
  canManageUsers
}: {
  users: UserDirectoryEntry[];
  canManageUsers: boolean;
}) {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("All");
  const [status, setStatus] = useState("All");

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const q = query.toLowerCase();
      const matchesQuery =
        !query ||
        user.full_name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q);
      const matchesRole = role === "All" || user.role === role;
      const matchesStatus = status === "All" || user.status === status;
      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [users, query, role, status]);

  if (!users.length) {
    return <EmptyState title="No users found" description="Add your first user to start assigning projects and tasks." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 md:flex-row">
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or email" />
          <Select value={role} onChange={(event) => setRole(event.target.value)}>
            <option>All</option>
            <option>Admin</option>
            <option>Project Manager</option>
            <option>Team Member</option>
            <option>Viewer</option>
          </Select>
          <Select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option>All</option>
            <option>Active</option>
            <option>Inactive</option>
            <option>Pending</option>
          </Select>
        </div>
        {canManageUsers ? <UserFormModal triggerLabel="Add User" /> : null}
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-6 py-4 font-medium">Full Name</th>
                <th className="px-6 py-4 font-medium">Email</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date Added</th>
                <th className="px-6 py-4 font-medium">Last Active</th>
                <th className="px-6 py-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4">
                    <UserDetailModal user={user} />
                  </td>
                  <td className="px-6 py-4 text-slate-600">{user.email}</td>
                  <td className="px-6 py-4"><Badge value={user.role} /></td>
                  <td className="px-6 py-4"><Badge value={user.status} /></td>
                  <td className="px-6 py-4 text-slate-600">{formatDate(user.created_at)}</td>
                  <td className="px-6 py-4 text-slate-600">{formatDate(user.last_active_at)}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {canManageUsers ? <UserFormModal triggerLabel="Edit" user={user} /> : null}
                      {canManageUsers ? <RemoveUserModal user={user} /> : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
