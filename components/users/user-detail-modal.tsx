"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { formatDate } from "@/lib/utils/format";
import type { UserDirectoryEntry } from "@/lib/types/domain";

export function UserDetailModal({ user }: { user: UserDirectoryEntry }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className="font-medium text-slate-950 hover:text-sky-700" onClick={() => setOpen(true)}>
        {user.full_name}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={user.full_name} description="User workspace profile and current assignment summary.">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Email</p>
            <p className="mt-2 font-medium text-slate-900">{user.email}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Role</p>
            <div className="mt-2"><Badge value={user.role} /></div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Status</p>
            <div className="mt-2"><Badge value={user.status} /></div>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Date Added</p>
            <p className="mt-2 font-medium text-slate-900">{formatDate(user.created_at)}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Last Active</p>
            <p className="mt-2 font-medium text-slate-900">{formatDate(user.last_active_at)}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Assigned Projects</p>
            <p className="mt-2 font-medium text-slate-900">{user.assignedProjects}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Assigned Tasks</p>
            <p className="mt-2 font-medium text-slate-900">{user.assignedTasks}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button variant="secondary" onClick={() => setOpen(false)} className="max-sm:w-full">
            Close
          </Button>
        </div>
      </Modal>
    </>
  );
}
