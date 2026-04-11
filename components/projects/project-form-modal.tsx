"use client";

import { Pencil } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/shared/form-field";
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";
import { PROJECT_PRIORITIES, PROJECT_STATUSES } from "@/lib/data/constants";
import { saveProjectAction } from "@/lib/actions/workspace";
import type { Profile, Project } from "@/lib/types/domain";

function getMemberLabel(profile: Profile) {
  return profile.full_name?.trim() || profile.email?.trim() || profile.id;
}

export function ProjectFormModal({
  profiles,
  project,
  triggerLabel = "New Project",
  triggerAriaLabel,
  triggerTitle,
  triggerIconOnly = false
}: {
  profiles: Profile[];
  project?: Project;
  triggerLabel?: string;
  triggerAriaLabel?: string;
  triggerTitle?: string;
  triggerIconOnly?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(project?.members?.map((member) => member.id) ?? []);
  const formRef = useRef<HTMLFormElement>(null);
  const { confirmOpen, requestClose, confirmLeave, stay, markClean } = useUnsavedChangesGuard({
    formRef,
    open,
    onDiscard: () => setOpen(false)
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    setSelectedMemberIds(project?.members?.map((member) => member.id) ?? []);
    setError(null);
  }, [open, project]);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant={project ? "secondary" : "primary"}
        className={
          triggerIconOnly
            ? "h-9 w-9 rounded-md border border-gray-200 bg-transparent p-0 text-slate-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#00ADB1]"
            : undefined
        }
        aria-label={triggerAriaLabel ?? triggerLabel}
        title={triggerTitle ?? triggerAriaLabel ?? triggerLabel}
      >
        {triggerIconOnly ? <Pencil className="h-4 w-4" /> : triggerLabel}
      </Button>
      <Modal
        open={open}
        onClose={requestClose}
        title={project ? "Edit project" : "Create project"}
        description="Capture scope, ownership, delivery dates, and team coverage."
      >
        {error ? <p className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
        <form
          ref={formRef}
          className="grid gap-4 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={project?.id ?? ""} />
          <FormField label="Project name" htmlFor="project-name">
            <Input id="project-name" name="name" defaultValue={project?.name} required />
          </FormField>
          <FormField label="Owner" htmlFor="owner-id">
            <Select id="owner-id" name="owner_id" defaultValue={project?.owner_id}>
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {getMemberLabel(profile)}
                </option>
              ))}
            </Select>
          </FormField>
          <div className="md:col-span-2">
            <FormField label="Description" htmlFor="description">
              <Textarea id="description" name="description" defaultValue={project?.description ?? ""} />
            </FormField>
          </div>
          <FormField label="Status" htmlFor="status">
            <Select id="status" name="status" defaultValue={project?.status ?? "Planning"}>
              {PROJECT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Priority" htmlFor="priority">
            <Select id="priority" name="priority" defaultValue={project?.priority ?? "Medium"}>
              {PROJECT_PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Start date" htmlFor="start-date">
            <Input id="start-date" name="start_date" type="date" defaultValue={project?.start_date ?? ""} />
          </FormField>
          <FormField label="Target end date" htmlFor="target-end-date">
            <Input id="target-end-date" name="target_end_date" type="date" defaultValue={project?.target_end_date ?? ""} />
          </FormField>
          <div className="md:col-span-2">
            <FormField
              label="Team members"
              hint={
                profiles.length ? "Select one or more team members assigned to this project." : "No team members available"
              }
            >
              <input type="hidden" name="team_members" value={selectedMemberIds.join(",")} />
              {profiles.length ? (
                <div className="grid gap-2 rounded-[11px] border border-[rgba(29,29,31,0.08)] bg-[#fafafc] p-4 md:grid-cols-2">
                  {profiles.map((profile) => {
                    const label = getMemberLabel(profile);
                    const isSelected = selectedMemberIds.includes(profile.id);

                    return (
                      <label
                        key={profile.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition ${
                          isSelected
                            ? "border-[#0071e3] bg-[#e8f3ff]"
                            : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          name="team_member_selection"
                          value={profile.id}
                          checked={isSelected}
                          onChange={(event) => {
                            setSelectedMemberIds((current) =>
                              event.target.checked
                                ? [...current, profile.id]
                                : current.filter((memberId) => memberId !== profile.id)
                            );
                          }}
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-[#0071e3] focus:ring-[#0071e3]"
                        />
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-slate-900">{label}</span>
                          <span className="mt-1 block text-xs text-slate-500">{profile.role}</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-[11px] border border-dashed border-[rgba(29,29,31,0.12)] bg-[#fafafc] px-4 py-3 text-sm text-slate-500">
                  No team members available
                </div>
              )}
            </FormField>
          </div>
          <div className="md:col-span-2">
            <FormField label="Tags" hint="Comma-separated tag names.">
              <Input name="tags" defaultValue={project?.tags?.map((tag) => tag.name).join(", ")} />
            </FormField>
          </div>
          <div className="md:col-span-2">
            <FormField label="Project notes">
              <Textarea name="notes" defaultValue={project?.notes ?? ""} />
            </FormField>
          </div>
          <div className="md:col-span-2 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={requestClose}>
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
                  const result = await saveProjectAction(formData);
                  if (!result?.ok) {
                    setError(result?.message || "Unable to save project.");
                    return;
                  }
                  markClean();
                  setOpen(false);
                  router.push(`/projects?success=${encodeURIComponent(result.message)}` as Route);
                  router.refresh();
                });
              }}
            >
              {isPending ? "Saving..." : project ? "Save changes" : "Create project"}
            </Button>
          </div>
        </form>
      </Modal>
      <ConfirmationDialog
        open={confirmOpen}
        title="Unsaved Changes"
        description="You have unsaved changes. Do you want to leave without saving?"
        confirmLabel="Leave Without Saving"
        cancelLabel="Stay"
        confirmVariant="primary"
        onConfirm={confirmLeave}
        onCancel={stay}
      />
    </>
  );
}
