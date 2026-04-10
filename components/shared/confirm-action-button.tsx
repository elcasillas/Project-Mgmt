"use client";

import { useRef, useState } from "react";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { Button } from "@/components/ui/button";

type ConfirmActionButtonProps = {
  action: (formData: FormData) => void | Promise<void>;
  fields: Array<{ name: string; value: string }>;
  children: React.ReactNode;
  dialogTitle?: string;
  dialogDescription?: string;
  confirmLabel?: string;
  cancelLabel?: string;
} & React.ComponentProps<typeof Button>;

export function ConfirmActionButton({
  action,
  fields,
  children,
  dialogTitle = "Confirm Delete",
  dialogDescription = "Are you sure you want to delete this item? This action cannot be undone.",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  ...buttonProps
}: ConfirmActionButtonProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <form ref={formRef} action={action}>
        {fields.map((field) => (
          <input key={field.name} type="hidden" name={field.name} value={field.value} />
        ))}
        <Button
          {...buttonProps}
          type="button"
          onClick={(event) => {
            buttonProps.onClick?.(event);
            if (event.defaultPrevented) {
              return;
            }
            setOpen(true);
          }}
        >
          {children}
        </Button>
      </form>
      <ConfirmationDialog
        open={open}
        title={dialogTitle}
        description={dialogDescription}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false);
          formRef.current?.requestSubmit();
        }}
      />
    </>
  );
}
