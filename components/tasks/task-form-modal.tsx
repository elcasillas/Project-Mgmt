"use client";

import { Eye, Pencil } from "lucide-react";
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
import { formatDate } from "@/lib/utils/format";
import { resolveTaskDependencyNames } from "@/lib/utils/task-dependencies";
import { saveTaskAction } from "@/lib/actions/workspace";
import type { Profile, Project, Task } from "@/lib/types/domain";

type ModalMode = "view" | "edit" | "create";

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
  initialMode,
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
  initialMode?: "view" | "edit";
  redirectPath?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const defaultMode: ModalMode = task ? (initialMode ?? "edit") : "create";
  const [modalMode, setModalMode] = useState<ModalMode>(defaultMode);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState(task?.project_id ?? initialProjectId ?? "");
  const [selectedDependencyIds, setSelectedDependencyIds] = useState<string[]>(task?.dependency_ids ?? []);
  const [dependencyQuery, setDependencyQuery] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const { confirmOpen, requestClose, confirmLeave, stay, markClean } = useUnsavedChangesGuard({
    formRef,
    open: open && modalMode === "edit",
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

    setModalMode(defaultMode);
    setSelectedProjectId(task?.project_id ?? initialProjectId ?? "");
    setSelectedDependencyIds(task?.dependency_ids ?? []);
    setDependencyQuery("");
    setError(null);
  }, [defaultMode, initialProjectId, open, task]);

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
        onClick={() => {
          setModalMode(defaultMode);
          setOpen(true);
        }}
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
        {triggerIconOnly ? (defaultMode === "view" ? <Eye className="h-4 w-4" /> : <Pencil className="h-4 w-4" />) : triggerLabel}
      </Button>
      <Modal
        open={open}
        onClose={requestClose}
        title={modalMode === "create" ? "Create task" : "Task Details"}
        description={
          modalMode === "view"
            ? "Review task ownership, timing, dependencies, and project linkage."
            : "Set ownership, timing, dependencies, and project linkage."
        }
        headerActions={
          task && modalMode === "view" ? (
            <Button
              variant="ghost"
              size="sm"
              className="bg-[rgba(255,255,255,0.72)]"
              aria-label="Edit Task"
              title="Edit Task"
              onClick={() => setModalMode("edit")}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          ) : null
        }
      >
        {error ? <p className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
        {modalMode === "view" && task ? (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">{task.title}</h3>
                <p className="mt-2 text-sm text-slate-500">{task.description || "No description provided."}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{task.status}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{task.priority}</span>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Project</p>
                <p className="mt-2 font-medium text-slate-900">{task.project?.name ?? "No project"}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Assignee</p>
                <p className="mt-2 font-medium text-slate-900">{task.assignee?.full_name ?? "Unassigned"}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Reporter</p>
                <p className="mt-2 font-medium text-slate-900">{task.reporter?.full_name ?? "Unknown"}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Due date</p>
                <p className="mt-2 font-medium text-slate-900">{formatDate(task.due_date)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Start date</p>
                <p className="mt-2 font-medium text-slate-900">{formatDate(task.start_date)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Hours</p>
                <p className="mt-2 font-medium text-slate-900">
                  {task.actual_hours ?? 0} / {task.estimated_hours ?? 0}
                </p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Tags</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {task.tags?.length ? (
                    task.tags.map((tag) => (
                      <span key={tag.id} className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                        {tag.name}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No tags</p>
                  )}
                </div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Dependencies</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {resolveTaskDependencyNames(task, availableTasks).length ? (
                    resolveTaskDependencyNames(task, availableTasks).map((dependencyName) => (
                      <span key={`${task.id}:${dependencyName}`} className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                        {dependencyName}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No dependencies</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="button" variant="ghost" onClick={requestClose}>
                Close
              </Button>
            </div>
          </div>
        ) : (
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
        )}
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
