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
import { TASK_PRIORITIES, TASK_STATUSES } from "@/lib/data/constants";
import { saveTaskAction } from "@/lib/actions/workspace";
import type { Profile, Project, Task } from "@/lib/types/domain";

export function TaskFormModal({
  profiles,
  projects,
  task,
  availableTasks = [],
  initialProjectId,
  lockProjectSelection = false,
  triggerLabel = "New Task",
  triggerAriaLabel,
  triggerTitle,
  triggerIconOnly = false,
  triggerVariant,
  triggerSize,
  triggerClassName,
  redirectPath
}: {
  profiles: Profile[];
  projects: Project[];
  task?: Task;
  availableTasks?: Task[];
  initialProjectId?: string;
  lockProjectSelection?: boolean;
  triggerLabel?: string;
  triggerAriaLabel?: string;
  triggerTitle?: string;
  triggerIconOnly?: boolean;
  triggerVariant?: "primary" | "secondary" | "ghost" | "danger";
  triggerSize?: "sm" | "md";
  triggerClassName?: string;
  redirectPath?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState(task?.project_id ?? initialProjectId ?? "");
  const [selectedDependencyIds, setSelectedDependencyIds] = useState<string[]>(task?.dependency_ids ?? []);
  const [dependencyQuery, setDependencyQuery] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const { confirmOpen, requestClose, confirmLeave, stay, markClean } = useUnsavedChangesGuard({
    formRef,
    open,
    onDiscard: () => setOpen(false)
  });
  const selectedProject = projects.find((projectOption) => projectOption.id === selectedProjectId);
  const availableDependencyTasks = availableTasks.filter(
    (candidateTask) => candidateTask.project_id === selectedProjectId && candidateTask.id !== task?.id
  );
  const filteredDependencyTasks = availableDependencyTasks.filter((candidateTask) => {
    const query = dependencyQuery.trim().toLowerCase();
    if (!query) {
      return true;
    }

    return (
      candidateTask.title.toLowerCase().includes(query) ||
      candidateTask.status.toLowerCase().includes(query) ||
      candidateTask.id.toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    setSelectedProjectId(task?.project_id ?? initialProjectId ?? "");
    setSelectedDependencyIds(task?.dependency_ids ?? []);
    setDependencyQuery("");
    setError(null);
  }, [initialProjectId, open, task]);

  useEffect(() => {
    if (!selectedProjectId) {
      setSelectedDependencyIds([]);
      return;
    }

    const validDependencyIds = new Set(
      availableTasks
        .filter((candidateTask) => candidateTask.project_id === selectedProjectId && candidateTask.id !== task?.id)
        .map((candidateTask) => candidateTask.id)
    );
    setSelectedDependencyIds((current) => current.filter((dependencyId) => validDependencyIds.has(dependencyId)));
  }, [selectedProjectId, task?.id, availableTasks]);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant={triggerVariant ?? (task ? "secondary" : "primary")}
        size={triggerSize ?? "md"}
        className={
          triggerIconOnly
            ? `h-9 w-9 rounded-md border border-gray-200 bg-transparent p-0 text-slate-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#00ADB1] ${triggerClassName ?? ""}`
            : triggerClassName
        }
        aria-label={triggerAriaLabel ?? triggerLabel}
        title={triggerTitle ?? triggerAriaLabel ?? triggerLabel}
      >
        {triggerIconOnly ? <Pencil className="h-4 w-4" /> : triggerLabel}
      </Button>
      <Modal
        open={open}
        onClose={requestClose}
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
            {lockProjectSelection ? (
              <>
                <input type="hidden" name="project_id" value={selectedProjectId} />
                <div className="flex min-h-11 items-center rounded-[11px] border border-[rgba(29,29,31,0.08)] bg-[#fafafc] px-4 text-[15px] text-slate-700">
                  {selectedProject?.name ?? "Current project"}
                </div>
              </>
            ) : (
              <Select
                name="project_id"
                value={selectedProjectId}
                onChange={(event) => {
                  setSelectedProjectId(event.target.value);
                }}
              >
                <option value="">No project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </Select>
            )}
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
            <FormField
              label="Dependencies"
              hint={
                selectedProjectId
                  ? "Select tasks in this project that must be completed first."
                  : "Choose a project before selecting dependencies."
              }
            >
              <input type="hidden" name="dependency_ids" value={selectedDependencyIds.join(",")} />
              <div className="space-y-3 rounded-[11px] border border-[rgba(29,29,31,0.08)] bg-[#fafafc] p-4">
                <Input
                  value={dependencyQuery}
                  onChange={(event) => setDependencyQuery(event.target.value)}
                  placeholder="Search tasks by name, status, or ID"
                  disabled={!selectedProjectId || !availableDependencyTasks.length}
                />
                {selectedProjectId ? (
                  availableDependencyTasks.length ? (
                    <div className="max-h-56 space-y-2 overflow-y-auto">
                      {filteredDependencyTasks.length ? (
                        filteredDependencyTasks.map((candidateTask) => {
                          const isSelected = selectedDependencyIds.includes(candidateTask.id);

                          return (
                            <button
                              key={candidateTask.id}
                              type="button"
                              className={`flex w-full items-start justify-between rounded-2xl border px-4 py-3 text-left transition ${
                                isSelected
                                  ? "border-[#0071e3] bg-[#e8f3ff]"
                                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                              }`}
                              onClick={() => {
                                setSelectedDependencyIds((current) =>
                                  current.includes(candidateTask.id)
                                    ? current.filter((dependencyId) => dependencyId !== candidateTask.id)
                                    : [...current, candidateTask.id]
                                );
                              }}
                            >
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-slate-900">{candidateTask.title}</p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {candidateTask.status} • {candidateTask.id}
                                </p>
                              </div>
                              <span
                                className={`ml-4 mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs ${
                                  isSelected ? "border-[#0071e3] bg-[#0071e3] text-white" : "border-gray-300 text-transparent"
                                }`}
                              >
                                ✓
                              </span>
                            </button>
                          );
                        })
                      ) : (
                        <p className="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-3 text-sm text-slate-500">
                          No matching tasks found in this project.
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-3 text-sm text-slate-500">
                      No other tasks available in this project.
                    </p>
                  )
                ) : (
                  <p className="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-3 text-sm text-slate-500">
                    Select a project to choose dependency tasks.
                  </p>
                )}
              </div>
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
                  const result = await saveTaskAction(formData);
                  if (!result?.ok) {
                    setError(result?.message || "Unable to save task.");
                    return;
                  }
                  markClean();
                  setOpen(false);
                  if (redirectPath) {
                    router.push(`${redirectPath}?success=${encodeURIComponent(result.message)}` as Route);
                  }
                  router.refresh();
                });
              }}
            >
              {isPending ? "Saving..." : task ? "Save changes" : "Create task"}
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
