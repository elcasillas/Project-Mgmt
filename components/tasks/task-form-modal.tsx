"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/shared/form-field";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/lib/data/constants";
import { saveTaskAction } from "@/lib/actions/workspace";
import type { Profile, Project, Task } from "@/lib/types/domain";

export function TaskFormModal({
  profiles,
  projects,
  task,
  triggerLabel = "New Task"
}: {
  profiles: Profile[];
  projects: Project[];
  task?: Task;
  triggerLabel?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <>
      <Button onClick={() => setOpen(true)} variant={task ? "secondary" : "primary"}>
        {triggerLabel}
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={task ? "Edit task" : "Create task"}
        description="Set ownership, timing, dependencies, and project linkage."
      >
        {error ? <p className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
        <form
          ref={formRef}
          className="grid gap-4 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={task?.id ?? ""} />
          <FormField label="Title">
            <Input name="title" defaultValue={task?.title} required />
          </FormField>
          <FormField label="Project">
            <Select name="project_id" defaultValue={task?.project_id ?? ""}>
              <option value="">No project</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </Select>
          </FormField>
          <div className="md:col-span-2">
            <FormField label="Description">
              <Textarea name="description" defaultValue={task?.description ?? ""} />
            </FormField>
          </div>
          <FormField label="Status">
            <Select name="status" defaultValue={task?.status ?? "Not Started"}>
              {TASK_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Priority">
            <Select name="priority" defaultValue={task?.priority ?? "Medium"}>
              {TASK_PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Assignee">
            <Select name="assignee_id" defaultValue={task?.assignee_id ?? ""}>
              <option value="">Unassigned</option>
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.full_name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Reporter">
            <Select name="reporter_id" defaultValue={task?.reporter_id ?? ""}>
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.full_name}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Start date">
            <Input name="start_date" type="date" defaultValue={task?.start_date ?? ""} />
          </FormField>
          <FormField label="Due date">
            <Input name="due_date" type="date" defaultValue={task?.due_date ?? ""} />
          </FormField>
          <FormField label="Estimated hours">
            <Input name="estimated_hours" type="number" step="0.5" defaultValue={task?.estimated_hours ?? ""} />
          </FormField>
          <FormField label="Actual hours">
            <Input name="actual_hours" type="number" step="0.5" defaultValue={task?.actual_hours ?? ""} />
          </FormField>
          <div className="md:col-span-2">
            <FormField label="Tags" hint="Comma-separated tag names.">
              <Input name="tags" defaultValue={task?.tags?.map((tag) => tag.name).join(", ")} />
            </FormField>
          </div>
          <div className="md:col-span-2">
            <FormField label="Dependency task ids" hint="Comma-separated UUIDs.">
              <Input name="dependency_ids" defaultValue={task?.dependency_ids?.join(", ")} />
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
                  const result = await saveTaskAction(formData);
                  if (!result?.ok) {
                    setError(result?.message || "Unable to save task.");
                    return;
                  }
                  setOpen(false);
                  router.push(`/tasks?success=${encodeURIComponent(result.message)}`);
                  router.refresh();
                });
              }}
            >
              {isPending ? "Saving..." : task ? "Save changes" : "Create task"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
