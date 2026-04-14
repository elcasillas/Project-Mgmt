"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash } from "lucide-react";
import { removeUserAction } from "@/lib/actions/users";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { Button } from "@/components/ui/button";
import type { UserDirectoryEntry } from "@/lib/types/domain";

export function RemoveUserModal({ user }: { user: UserDirectoryEntry }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const deleteButtonClassName =
    "h-9 w-9 rounded-md border border-gray-200 bg-transparent p-0 text-slate-700 hover:bg-gray-100 hover:text-red-600 active:text-red-600 focus:outline-none focus:ring-2 focus:ring-[#00ADB1]";

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className={deleteButtonClassName}
        onClick={() => setOpen(true)}
        aria-label="Delete user"
        title="Delete"
      >
        <Trash className="h-4 w-4" />
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
