"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeUserAction } from "@/lib/actions/users";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import type { UserDirectoryEntry } from "@/lib/types/domain";

export function RemoveUserModal({ user }: { user: UserDirectoryEntry }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        Remove
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Remove user" description="This will deactivate the user and revoke active application access.">
        {error ? <p className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
        <p className="text-sm text-slate-600">
          {user.full_name} will lose access to the application. Their project ownership, tasks, comments, and audit history will be preserved.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                setError(null);
                const result = await removeUserAction({ id: user.id });
                if (!result.ok) {
                  setError(result.message);
                  return;
                }

                setOpen(false);
                router.refresh();
              });
            }}
          >
            {isPending ? "Removing..." : "Confirm Remove"}
          </Button>
        </div>
      </Modal>
    </>
  );
}
