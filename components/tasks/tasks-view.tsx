"use client";

import { useMemo, useState } from "react";
import { addDays, eachDayOfInterval, endOfMonth, format, startOfMonth } from "date-fns";
import { addCommentAction, deleteAttachmentAction } from "@/lib/actions/workspace";
import { ConfirmActionButton } from "@/components/shared/confirm-action-button";
import { AttachmentUploader } from "@/components/shared/attachment-uploader";
import { TaskFormModal } from "@/components/tasks/task-form-modal";
import { TasksBoard } from "@/components/tasks/tasks-board";
import { TaskTable } from "@/components/tasks/task-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, isDueThisWeek, isOverdue } from "@/lib/utils/format";
import type { Attachment, Comment, Profile, Project, Task } from "@/lib/types/domain";

type ViewMode = "table" | "kanban" | "calendar";

export function TasksView({
  tasks,
  profiles,
  projects,
  comments,
  attachments,
  selectedTaskId
}: {
  tasks: Task[];
  profiles: Profile[];
  projects: Project[];
  comments: Comment[];
  attachments: Attachment[];
  selectedTaskId?: string;
}) {
  const [view, setView] = useState<ViewMode>("table");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");
  const [assignee, setAssignee] = useState("All");
  const [project, setProject] = useState("All");
  const [dueWindow, setDueWindow] = useState("All");

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesQuery =
        !query ||
        task.title.toLowerCase().includes(query.toLowerCase()) ||
        task.description?.toLowerCase().includes(query.toLowerCase()) ||
        task.project?.name.toLowerCase().includes(query.toLowerCase()) ||
        task.tags?.some((tag) => tag.name.toLowerCase().includes(query.toLowerCase()));
      const matchesStatus = status === "All" || task.status === status;
      const matchesPriority = priority === "All" || task.priority === priority;
      const matchesAssignee = assignee === "All" || task.assignee_id === assignee;
      const matchesProject = project === "All" || task.project_id === project;
      const matchesDueWindow =
        dueWindow === "All" ||
        (dueWindow === "Overdue" && isOverdue(task.due_date, task.status === "Done")) ||
        (dueWindow === "This Week" && isDueThisWeek(task.due_date)) ||
        (dueWindow === "No Due Date" && !task.due_date);

      return matchesQuery && matchesStatus && matchesPriority && matchesAssignee && matchesProject && matchesDueWindow;
    });
  }, [tasks, query, status, priority, assignee, project, dueWindow]);

  const calendarDays = eachDayOfInterval({
    start: startOfMonth(new Date()),
    end: endOfMonth(addDays(new Date(), 28))
  });

  const selectedTask = tasks.find((task) => task.id === selectedTaskId);
  const activeTask = selectedTask ?? filteredTasks[0];
  const taskComments = comments.filter((comment) => comment.task_id === activeTask?.id);
  const taskAttachments = attachments.filter((attachment) => attachment.task_id === activeTask?.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 md:flex-row">
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tasks, projects, and descriptions" />
          <Select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option>All</option>
            <option>Not Started</option>
            <option>In Progress</option>
            <option>Blocked</option>
            <option>In Review</option>
            <option>Done</option>
          </Select>
          <Select value={priority} onChange={(event) => setPriority(event.target.value)}>
            <option>All</option>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Urgent</option>
          </Select>
          <Select value={assignee} onChange={(event) => setAssignee(event.target.value)}>
            <option value="All">All assignees</option>
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.full_name}
              </option>
            ))}
          </Select>
          <Select value={project} onChange={(event) => setProject(event.target.value)}>
            <option value="All">All projects</option>
            {projects.map((currentProject) => (
              <option key={currentProject.id} value={currentProject.id}>
                {currentProject.name}
              </option>
            ))}
          </Select>
          <Select value={dueWindow} onChange={(event) => setDueWindow(event.target.value)}>
            <option>All</option>
            <option>Overdue</option>
            <option>This Week</option>
            <option>No Due Date</option>
          </Select>
        </div>
        <div className="flex gap-2">
          {(["table", "kanban", "calendar"] as ViewMode[]).map((mode) => (
            <Button key={mode} variant={view === mode ? "primary" : "secondary"} size="sm" onClick={() => setView(mode)}>
              {mode[0].toUpperCase() + mode.slice(1)}
            </Button>
          ))}
          <TaskFormModal profiles={profiles} projects={projects} availableTasks={tasks} redirectPath="/tasks" triggerSize="sm" />
        </div>
      </div>

      {view === "table" ? (
        <TaskTable
          tasks={filteredTasks}
          allTasks={tasks}
          profiles={profiles}
          projects={projects}
          selectedTaskId={selectedTask?.id}
          redirectPath="/tasks"
        />
      ) : null}

      {view === "kanban" ? <TasksBoard tasks={filteredTasks} /> : null}

      {view === "calendar" ? (
        <Card className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Calendar view</h2>
            <p className="text-sm text-slate-500">Tasks grouped by due date across the current month.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-7">
            {calendarDays.map((day) => {
              const dayTasks = filteredTasks.filter((task) => task.due_date === format(day, "yyyy-MM-dd"));
              return (
                <div key={day.toISOString()} className="min-h-[160px] rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
                  <p className="text-sm font-semibold text-slate-900">{format(day, "MMM d")}</p>
                  <div className="mt-3 space-y-2">
                    {dayTasks.map((task) => (
                      <div key={task.id} className="rounded-xl border border-gray-200 bg-white p-3">
                        <p className="text-sm font-medium text-slate-900">{task.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{task.project?.name ?? "General task"}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ) : null}

      {activeTask ? (
        <div className="grid gap-6 xl:grid-cols-[1.15fr_1fr]">
          <Card className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">{activeTask.title}</h2>
                <p className="mt-2 text-sm text-slate-500">{activeTask.description || "No description provided."}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge value={activeTask.status} />
                <Badge value={activeTask.priority} />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Project</p>
                <p className="mt-2 font-medium text-slate-900">{activeTask.project?.name ?? "General task"}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Assignee</p>
                <p className="mt-2 font-medium text-slate-900">{activeTask.assignee?.full_name ?? "Unassigned"}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Due date</p>
                <p className="mt-2 font-medium text-slate-900">{formatDate(activeTask.due_date)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Hours</p>
                <p className="mt-2 font-medium text-slate-900">
                  {activeTask.actual_hours ?? 0} / {activeTask.estimated_hours ?? 0}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-base font-semibold text-slate-950">Comments</h3>
              <div className="space-y-3">
                {taskComments.map((comment) => (
                  <div key={comment.id} className="rounded-2xl border border-slate-100 p-4">
                    <p className="text-sm text-slate-700">{comment.body}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      {comment.author?.full_name ?? "Unknown"} • {formatDate(comment.created_at)}
                    </p>
                  </div>
                ))}
              </div>
              <form action={addCommentAction} className="space-y-3">
                <input type="hidden" name="task_id" value={activeTask.id} />
                <input type="hidden" name="project_id" value={activeTask.project_id ?? ""} />
                <Textarea name="body" placeholder="Add a comment or unblock note" />
                <Button>Add comment</Button>
              </form>
            </div>
          </Card>
          <Card className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold text-slate-950">Attachments</h3>
              <p className="text-sm text-slate-500">Files linked to the selected task.</p>
            </div>
            <div className="space-y-3">
              {taskAttachments.map((attachment) => (
                <div key={attachment.id} className="rounded-2xl border border-slate-100 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-900">{attachment.file_name}</p>
                      <p className="text-xs text-slate-500">{attachment.uploader?.full_name ?? "Unknown uploader"}</p>
                    </div>
                    <div className="flex gap-2">
                      <a href={attachment.file_url} target="_blank" rel="noreferrer" className="text-sm font-medium text-sky-600">
                        Open
                      </a>
                      <ConfirmActionButton
                        action={deleteAttachmentAction}
                        fields={[
                          { name: "attachment_id", value: attachment.id },
                          { name: "file_path", value: attachment.file_path },
                          { name: "project_id", value: activeTask.project_id ?? "" }
                        ]}
                        variant="ghost"
                        size="sm"
                      >
                        Delete
                      </ConfirmActionButton>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <AttachmentUploader taskId={activeTask.id} />
          </Card>
        </div>
      ) : null}
    </div>
  );
}
