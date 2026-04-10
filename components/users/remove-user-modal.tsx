"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { removeUserAction } from "@/lib/actions/users";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { Button } from "@/components/ui/button";
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
      <ConfirmationDialog
        open={open}
        title="Confirm Delete"
        description={error ?? "Are you sure you want to delete this item? This action cannot be undone."}
        confirmLabel={isPending ? "Deleting..." : "Delete"}
        cancelLabel="Cancel"
        isPending={isPending}
        onCancel={() => setOpen(false)}
        onConfirm={() => {
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
      />
    </>
  );
}
