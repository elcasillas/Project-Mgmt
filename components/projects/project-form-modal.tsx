"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/shared/form-field";
import { PROJECT_PRIORITIES, PROJECT_STATUSES } from "@/lib/data/constants";
import { saveProjectAction } from "@/lib/actions/workspace";
import type { Profile, Project } from "@/lib/types/domain";

export function ProjectFormModal({
  profiles,
  project,
  triggerLabel = "New Project"
}: {
  profiles: Profile[];
  project?: Project;
  triggerLabel?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <>
      <Button onClick={() => setOpen(true)} variant={project ? "secondary" : "primary"}>
        {triggerLabel}
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
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
                  {profile.full_name}
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
            <FormField label="Team member ids" hint="Comma-separated UUIDs for initial project membership.">
              <Input name="team_members" defaultValue={project?.members?.map((member) => member.id).join(", ")} />
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
                  const result = await saveProjectAction(formData);
                  if (!result?.ok) {
                    setError(result?.message || "Unable to save project.");
                    return;
                  }
                  setOpen(false);
                  router.push(`/projects?success=${encodeURIComponent(result.message)}`);
                  router.refresh();
                });
              }}
            >
              {isPending ? "Saving..." : project ? "Save changes" : "Create project"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
