"use client";

import { Eye, Pencil, Plus, Trash } from "lucide-react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/shared/form-field";
import { useUnsavedChangesGuard } from "@/hooks/use-unsaved-changes-guard";
import { TASK_PRIORITIES, TASK_STATUSES } from "@/lib/data/constants";
import { cn } from "@/lib/utils/cn";
import { formatTaskDate, getTaskDateInputValue } from "@/lib/utils/task-dates";
import { resolveTaskDependencyNames } from "@/lib/utils/task-dependencies";
import { saveTaskAction } from "@/lib/actions/workspace";
import type { Profile, Project, Task, TaskPurchaseItem } from "@/lib/types/domain";

type ModalMode = "view" | "edit" | "create";
const TASK_MODAL_PANEL_CLASS = "max-w-4xl";

function createEmptyPurchaseItem(): TaskPurchaseItem {
  return {
    id: crypto.randomUUID(),
    name: ""
  };
}

function DetailField({
  label,
  value,
  className
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-[12px] bg-white p-5 shadow-[rgba(0,0,0,0.06)_0px_10px_30px]", className)}>
      <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[rgba(29,29,31,0.5)]">{label}</p>
      <div className="mt-3 break-words text-[17px] font-medium leading-[1.35] tracking-[-0.01em] text-[#1d1d1f]">{value}</div>
    </div>
  );
}

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
  triggerStyle,
  renderTrigger,
  initialMode,
  redirectPath
}: {
  profiles: Profile[];
  projects: Project[];
  task?: Task;
  availableTasks?: Task[];
  initialProjectId?: string;
  lockProjectSelection?: boolean;
  triggerLabel?: React.ReactNode;
  triggerAriaLabel?: string;
  triggerTitle?: string;
  triggerIconOnly?: boolean;
  triggerVariant?: "primary" | "secondary" | "ghost" | "danger";
  triggerSize?: "sm" | "md";
  triggerClassName?: string;
  triggerStyle?: React.CSSProperties;
  renderTrigger?: (options: {
    open: () => void;
    defaultMode: ModalMode;
    ariaLabel?: string;
    title?: string;
  }) => React.ReactNode;
  initialMode?: "view" | "edit";
  redirectPath?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const defaultMode: ModalMode = task ? (initialMode ?? "edit") : "create";
  const [modalMode, setModalMode] = useState<ModalMode>(defaultMode);
  const [returnToViewOnEditExit, setReturnToViewOnEditExit] = useState(defaultMode === "view");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState(task?.project_id ?? initialProjectId ?? "");
  const [selectedDependencyIds, setSelectedDependencyIds] = useState<string[]>(task?.dependency_ids ?? []);
  const [purchaseItems, setPurchaseItems] = useState<TaskPurchaseItem[]>(task?.purchaseItems?.length ? task.purchaseItems : [createEmptyPurchaseItem()]);
  const [dependencyQuery, setDependencyQuery] = useState("");
  const defaultTriggerText = typeof triggerLabel === "string" ? triggerLabel : undefined;
  const formRef = useRef<HTMLFormElement>(null);
  const addPurchaseItem = () => {
    setPurchaseItems((current) => [...current, createEmptyPurchaseItem()]);
  };
  const updatePurchaseItem = (itemId: string, name: string) => {
    setPurchaseItems((current) => current.map((entry) => (entry.id === itemId ? { ...entry, name } : entry)));
  };
  const removePurchaseItem = (itemId: string) => {
    setPurchaseItems((current) => (current.length === 1 ? [createEmptyPurchaseItem()] : current.filter((entry) => entry.id !== itemId)));
  };
  const openModal = () => {
    setModalMode(defaultMode);
    setReturnToViewOnEditExit(defaultMode === "view");
    setOpen(true);
  };
  const handleModalDismiss = () => {
    setError(null);
    if (modalMode === "edit" && task && returnToViewOnEditExit) {
      setModalMode("view");
      return;
    }

    setOpen(false);
  };
  const { confirmOpen, requestClose, confirmLeave, stay, markClean } = useUnsavedChangesGuard({
    formRef,
    open: open && modalMode === "edit",
    onDiscard: handleModalDismiss
  });
  const selectedProject = projects.find((projectOption) => projectOption.id === selectedProjectId);
  const dependencyNames = task ? resolveTaskDependencyNames(task, availableTasks) : [];
  const sectionClassName = "rounded-[12px] bg-white p-5 shadow-[rgba(0,0,0,0.08)_0px_12px_32px]";
  const sectionHeadingClassName = "text-[21px] font-semibold leading-[1.19] tracking-[0.01em] text-[#1d1d1f]";
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
    setReturnToViewOnEditExit(defaultMode === "view");
    setSelectedProjectId(task?.project_id ?? initialProjectId ?? "");
    setSelectedDependencyIds(task?.dependency_ids ?? []);
    setPurchaseItems(task?.purchaseItems?.length ? task.purchaseItems : [createEmptyPurchaseItem()]);
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
      {renderTrigger ? (
        renderTrigger({
          open: openModal,
          defaultMode,
          ariaLabel: triggerAriaLabel ?? defaultTriggerText,
          title: triggerTitle ?? triggerAriaLabel ?? defaultTriggerText
        })
      ) : (
        <Button
          onClick={openModal}
          variant={triggerVariant ?? (task ? "secondary" : "primary")}
          size={triggerSize ?? "md"}
          className={
            triggerIconOnly
              ? `h-9 w-9 rounded-md border border-gray-200 bg-transparent p-0 text-slate-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#00ADB1] ${triggerClassName ?? ""}`
              : triggerClassName
          }
          aria-label={triggerAriaLabel ?? defaultTriggerText}
          title={triggerTitle ?? triggerAriaLabel ?? defaultTriggerText}
          style={triggerStyle}
        >
          {triggerIconOnly ? (defaultMode === "view" ? <Eye className="h-4 w-4" /> : <Pencil className="h-4 w-4" />) : triggerLabel}
        </Button>
      )}
      <Modal
        open={open}
        onClose={requestClose}
        title={modalMode === "create" ? "Create Task" : modalMode === "edit" ? "Edit Task" : "Task Details"}
        description={
          modalMode === "view"
            ? "Review task ownership, timing, dependencies, and project linkage."
            : "Shape scope, ownership, and timing in one focused workflow."
        }
        panelClassName={TASK_MODAL_PANEL_CLASS}
        headerActions={
          task && modalMode === "view" ? (
            <Button
              variant="ghost"
              size="sm"
              className="bg-[rgba(255,255,255,0.72)]"
              aria-label="Edit Task"
              title="Edit Task"
              onClick={() => {
                setReturnToViewOnEditExit(true);
                setModalMode("edit");
              }}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          ) : null
        }
      >
        {error ? <p className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p> : null}
        {modalMode === "view" && task ? (
          <div className="space-y-6">
            <section className="rounded-[12px] bg-[#1d1d1f] px-5 py-6 text-white sm:px-6">
              <div className="min-w-0">
                <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-white/55">Task overview</p>
                <h3 className="mt-3 text-[28px] font-semibold leading-[1.14] tracking-[-0.02em] break-words sm:text-[32px]">
                  {task.title}
                </h3>
                <p className="mt-4 max-w-3xl text-[15px] leading-[1.47] tracking-[-0.01em] text-white/78">
                  {task.description || "No description provided."}
                </p>
              </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.95fr)]">
              <section className="space-y-4">
                <DetailField label="Project" value={task.project?.name ?? "Not set"} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <DetailField label="Assignee" value={task.assignee?.full_name ?? "Not set"} />
                  <DetailField label="Reporter" value={task.reporter?.full_name ?? "Not set"} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <DetailField label="Start date" value={formatTaskDate(task.start_date)} />
                  <DetailField label="Due date" value={formatTaskDate(task.due_date)} />
                </div>
              </section>

              <section className="space-y-4">
                <DetailField
                  label="Status"
                  value={
                    <div className="flex flex-wrap gap-2">
                      <Badge value={task.status} />
                    </div>
                  }
                />
                <DetailField
                  label="Priority"
                  value={
                    <div className="flex flex-wrap gap-2">
                      <Badge value={task.priority} />
                    </div>
                  }
                />
                <DetailField
                  label="Dependencies"
                  value={
                    dependencyNames.length ? (
                      <div className="flex flex-wrap gap-2">
                        {dependencyNames.map((dependencyName) => (
                          <span
                            key={`${task.id}:${dependencyName}`}
                            className="inline-flex rounded-full bg-[#f5f5f7] px-3 py-1 text-[14px] font-medium tracking-[-0.01em] text-[rgba(29,29,31,0.72)]"
                          >
                            {dependencyName}
                          </span>
                        ))}
                      </div>
                    ) : (
                      "None"
                    )
                  }
                />
                <DetailField
                  label="Hours"
                  value={
                    task.actual_hours == null && task.estimated_hours == null
                      ? "Not set"
                      : `${task.actual_hours ?? 0} / ${task.estimated_hours ?? 0}`
                  }
                />
                <DetailField
                  label="Purchase Items"
                  value={
                    task.purchaseItems?.length ? (
                      <ul className="space-y-2 text-[15px] font-medium leading-[1.45] text-[#1d1d1f]">
                        {task.purchaseItems.map((item) => (
                          <li key={item.id} className="rounded-[10px] bg-[#f5f5f7] px-3 py-2">
                            {item.name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      "No purchase items added"
                    )
                  }
                />
              </section>
            </div>

            <div className="flex justify-end border-t border-[rgba(29,29,31,0.08)] pt-2">
              <Button type="button" variant="ghost" onClick={requestClose} className="max-sm:w-full">
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form
            ref={formRef}
            className="space-y-6"
            onSubmit={(event) => {
              event.preventDefault();
            }}
          >
            <input type="hidden" name="id" value={task?.id ?? ""} />
            <div className="rounded-[12px] bg-[#1d1d1f] px-5 py-6 text-white">
              <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-white/55">
                {task ? "Task refinement" : "Task creation"}
              </p>
              <h3 className="mt-3 text-[28px] font-semibold leading-[1.14] tracking-[-0.02em]">
                {task ? task.title : "Define the work clearly before execution starts."}
              </h3>
            </div>

            <section className={sectionClassName}>
              <div className="mb-5 space-y-1">
                <h3 className={sectionHeadingClassName}>Core Details</h3>
                <p className="text-[14px] leading-[1.43] tracking-[-0.01em] text-[rgba(29,29,31,0.56)]">
                  Start with the task identity, project placement, and execution priority.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <FormField label="Title">
                    <Input name="title" defaultValue={task?.title} required />
                  </FormField>
                </div>
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
                <div className="md:col-span-2">
                  <FormField label="Description">
                    <Textarea name="description" defaultValue={task?.description ?? ""} className="min-h-[140px]" />
                  </FormField>
                </div>
              </div>
            </section>

            <section className={sectionClassName}>
              <div className="mb-5 space-y-1">
                <h3 className={sectionHeadingClassName}>Ownership And Schedule</h3>
                <p className="text-[14px] leading-[1.43] tracking-[-0.01em] text-[rgba(29,29,31,0.56)]">
                  Assign accountability and set the dates and effort needed to finish the work.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
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
                  <Input name="start_date" type="date" defaultValue={getTaskDateInputValue(task?.start_date)} />
                </FormField>
                <FormField label="Due date">
                  <Input name="due_date" type="date" defaultValue={getTaskDateInputValue(task?.due_date)} />
                </FormField>
                <FormField label="Estimated hours">
                  <Input name="estimated_hours" type="number" step="0.5" defaultValue={task?.estimated_hours ?? ""} />
                </FormField>
                <FormField label="Actual hours">
                  <Input name="actual_hours" type="number" step="0.5" defaultValue={task?.actual_hours ?? ""} />
                </FormField>
              </div>
            </section>

            <section className={sectionClassName}>
              <div className="mb-5 space-y-1">
                <h3 className={sectionHeadingClassName}>Purchase Items</h3>
                <p className="text-[14px] leading-[1.43] tracking-[-0.01em] text-[rgba(29,29,31,0.56)]">
                  Track anything that may need to be bought before the task can be completed.
                </p>
              </div>
              <input type="hidden" name="purchase_items" value={JSON.stringify(purchaseItems)} />
              <div className="space-y-3">
                {purchaseItems.map((item, index) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <Input
                      value={item.name}
                      onChange={(event) => updatePurchaseItem(item.id, event.target.value)}
                      placeholder="Enter item to purchase"
                      aria-label={`Purchase item ${index + 1}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label={`Remove purchase item ${index + 1}`}
                      title="Remove item"
                      className="mt-1 h-10 w-10 shrink-0 rounded-[11px] border border-[rgba(29,29,31,0.08)] bg-white p-0 text-slate-600 hover:bg-slate-50"
                      onClick={() => removePurchaseItem(item.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={addPurchaseItem}
                >
                  <Plus className="h-4 w-4" />
                  + Add Item
                </Button>
              </div>
            </section>

            <section className={sectionClassName}>
              <div className="mb-5 space-y-1">
                <h3 className={sectionHeadingClassName}>Dependencies</h3>
                <p className="text-[14px] leading-[1.43] tracking-[-0.01em] text-[rgba(29,29,31,0.56)]">
                  Define the tasks that must land first so execution order stays explicit.
                </p>
              </div>
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
            </section>

            <div className="rounded-[12px] bg-white p-5 shadow-[rgba(0,0,0,0.08)_0px_12px_32px]">
              <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
                <Button type="button" variant="ghost" onClick={requestClose} className="max-sm:w-full">
                  Cancel
                </Button>
                <Button
                  type="button"
                  disabled={isPending}
                  className="max-sm:w-full"
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
                      if (task && returnToViewOnEditExit) {
                        setModalMode("view");
                        router.refresh();
                        return;
                      }

                      setOpen(false);
                      if (redirectPath) {
                        router.push(`${redirectPath}?success=${encodeURIComponent(result.message)}` as Route);
                      }
                      router.refresh();
                    });
                  }}
                >
                  {isPending ? "Saving..." : task ? "Save" : "Create task"}
                </Button>
              </div>
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
