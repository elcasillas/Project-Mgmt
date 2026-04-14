"use client";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  isPending = false,
  confirmVariant = "danger"
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  isPending?: boolean;
  confirmVariant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title} description={description}>
      <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
        <Button type="button" variant="ghost" onClick={onCancel} className="max-sm:w-full">
          {cancelLabel}
        </Button>
        <Button type="button" variant={confirmVariant} disabled={isPending} onClick={onConfirm} className="max-sm:w-full">
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
