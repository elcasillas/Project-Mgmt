"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FormField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { USER_ROLES, USER_STATUSES } from "@/lib/data/constants";
import { saveUserAction } from "@/lib/actions/users";
import type { UserDirectoryEntry } from "@/lib/types/domain";

export function UserFormModal({
  triggerLabel,
  user
}: {
  triggerLabel: string;
  user?: UserDirectoryEntry;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <>
      <Button variant={user ? "secondary" : "primary"} size="sm" onClick={() => setOpen(true)}>
        {triggerLabel}
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={user ? "Edit user" : "Add user"}
        description="Manage workspace access, role assignment, and account status."
      >
        {error ? <p className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
        {success ? <p className="mb-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p> : null}
        <form ref={formRef} className="grid gap-4 md:grid-cols-2" onSubmit={(event) => event.preventDefault()}>
          <input type="hidden" name="id" value={user?.id ?? ""} />
          <FormField label="First Name">
            <Input name="first_name" defaultValue={user?.first_name ?? ""} required />
          </FormField>
          <FormField label="Last Name">
            <Input name="last_name" defaultValue={user?.last_name ?? ""} required />
          </FormField>
          <div className="md:col-span-2">
            <FormField label="Email">
              <Input name="email" type="email" defaultValue={user?.email ?? ""} required />
            </FormField>
          </div>
          <FormField label="Role">
            <Select name="role" defaultValue={user?.role ?? "Team Member"}>
              {USER_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Status">
            <Select name="status" defaultValue={user?.status ?? "Active"}>
              {USER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </FormField>
          <div className="md:col-span-2 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isPending}
              onClick={() => {
                if (!formRef.current) {
                  return;
                }

                const formData = new FormData(formRef.current);
                startTransition(async () => {
                  setError(null);
                  setSuccess(null);
                  const result = await saveUserAction({
                    id: String(formData.get("id") || "") || undefined,
                    first_name: String(formData.get("first_name") || ""),
                    last_name: String(formData.get("last_name") || ""),
                    email: String(formData.get("email") || ""),
                    role: String(formData.get("role") || "Team Member") as UserDirectoryEntry["role"],
                    status: String(formData.get("status") || "Active") as UserDirectoryEntry["status"]
                  });

                  if (!result.ok) {
                    setError(result.message);
                    return;
                  }

                  setSuccess(result.message);
                  setOpen(false);
                  router.refresh();
                });
              }}
            >
              {isPending ? "Saving..." : user ? "Save Changes" : "Create User"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
