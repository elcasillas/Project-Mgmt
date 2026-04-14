"use client";

import { useMemo, useState } from "react";
import { addCommentAction, deleteAttachmentAction } from "@/lib/actions/workspace";
import { ConfirmActionButton } from "@/components/shared/confirm-action-button";
import { AttachmentUploader } from "@/components/shared/attachment-uploader";
import { TaskFormModal } from "@/components/tasks/task-form-modal";
import { TaskTable } from "@/components/tasks/task-table";
import { AvatarGroup } from "@/components/ui/avatar-group";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { canManageTasks } from "@/lib/utils/permissions";
import { formatDate, formatRelative } from "@/lib/utils/format";
import type { Attachment, Comment, Project, Task, ActivityLog, Profile, UserRole } from "@/lib/types/domain";

type Tab = "Overview" | "Tasks" | "Team" | "Activity" | "Files";

export function ProjectDetailTabs({
  project,
  tasks,
  activity,
  comments,
  attachments,
  profiles,
  projects,
  currentUserRole
}: {
  project: Project;
  tasks: Task[];
  activity: ActivityLog[];
  comments: Comment[];
  attachments: Attachment[];
  profiles: Profile[];
  projects: Project[];
  currentUserRole?: UserRole | null;
}) {
  const [tab, setTab] = useState<Tab>("Overview");
  const latestComments = useMemo(() => comments.slice(0, 8), [comments]);
  const canEditTasks = canManageTasks(currentUserRole);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {(["Overview", "Tasks", "Team", "Activity", "Files"] as Tab[]).map((item) => (
            <Button key={item} variant={tab === item ? "primary" : "secondary"} size="sm" onClick={() => setTab(item)}>
              {item}
            </Button>
          ))}
        </div>
        {canEditTasks ? (
          <TaskFormModal
            profiles={profiles}
            projects={projects}
            availableTasks={tasks}
            initialProjectId={project.id}
            lockProjectSelection
            redirectPath={`/projects/${project.id}`}
            triggerLabel="New Task"
            triggerAriaLabel="Create Task"
            triggerTitle="Create Task"
            triggerSize="sm"
            triggerVariant="secondary"
            triggerClassName="max-sm:w-full sm:ml-auto"
          />
        ) : null}
      </div>

      {tab === "Overview" ? (
        <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
          <Card className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Project summary</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{project.description}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Status</p>
                <div className="mt-2"><Badge value={project.status} /></div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Priority</p>
                <div className="mt-2"><Badge value={project.priority} /></div>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Start date</p>
                <p className="mt-2 font-medium text-slate-900">{formatDate(project.start_date)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Target end date</p>
                <p className="mt-2 font-medium text-slate-900">{formatDate(project.target_end_date)}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Project progress</span>
                <span className="font-medium text-slate-900">{project.progress}%</span>
              </div>
              <Progress value={project.progress} />
            </div>
          </Card>
          <div className="space-y-6">
            <Card className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">Team members</h3>
                <p className="text-sm text-slate-500">Current staffing on the project.</p>
              </div>
              <AvatarGroup users={project.members ?? []} />
            </Card>
            <Card className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">Project notes</h3>
                <p className="text-sm text-slate-500">Working notes and executive highlights.</p>
              </div>
              <p className="text-sm text-slate-600">{project.notes ?? "No notes yet."}</p>
            </Card>
          </div>
        </div>
      ) : null}

      {tab === "Tasks" ? (
        <TaskTable
          tasks={tasks}
          profiles={profiles}
          projects={projects}
          canEditTasks={canEditTasks}
          redirectPath={`/projects/${project.id}`}
        />
      ) : null}

      {tab === "Team" ? (
        <Card className="space-y-4">
          {(project.members ?? []).map((member) => (
            <div key={member.id} className="flex flex-col gap-3 rounded-2xl border border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-slate-900">{member.full_name}</p>
                <p className="text-sm text-slate-500">{member.email}</p>
              </div>
              <Badge value={member.role} />
            </div>
          ))}
        </Card>
      ) : null}

      {tab === "Activity" ? (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          <Card className="space-y-4">
            {activity.map((entry) => (
              <div key={entry.id} className="rounded-2xl border border-slate-100 p-4">
                <p className="text-sm text-slate-700">
                  <span className="font-semibold text-slate-950">{entry.actor?.full_name ?? "Unknown user"}</span>{" "}
                  {entry.action.replaceAll("_", " ")}
                </p>
                <p className="mt-1 text-xs text-slate-500">{formatRelative(entry.created_at)}</p>
              </div>
            ))}
          </Card>
          <Card className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-950">Latest task comments</h3>
            {latestComments.map((comment) => (
              <div key={comment.id} className="rounded-2xl border border-slate-100 p-4">
                <p className="text-sm text-slate-700">{comment.body}</p>
                <p className="mt-2 text-xs text-slate-500">
                  {comment.author?.full_name ?? "Unknown"} • {formatRelative(comment.created_at)}
                </p>
              </div>
            ))}
            {tasks[0] ? (
              <form action={addCommentAction} className="space-y-3">
                <input type="hidden" name="project_id" value={project.id} />
                <input type="hidden" name="task_id" value={tasks[0].id} />
                <Textarea name="body" placeholder="Add a project activity note to the first active task" />
                <Button>Add comment</Button>
              </form>
            ) : null}
          </Card>
        </div>
      ) : null}

      {tab === "Files" ? (
        <Card className="space-y-4">
          {attachments.length ? (
            attachments.map((attachment) => (
              <div key={attachment.id} className="flex flex-col gap-3 rounded-2xl border border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="break-words font-medium text-slate-900">{attachment.file_name}</p>
                  <p className="text-sm text-slate-500">
                    Uploaded by {attachment.uploader?.full_name ?? "Unknown"} on {formatDate(attachment.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a className="text-sm font-medium text-sky-600" href={attachment.file_url} target="_blank" rel="noreferrer">
                    Open
                  </a>
                  <ConfirmActionButton
                    action={deleteAttachmentAction}
                    fields={[
                      { name: "attachment_id", value: attachment.id },
                      { name: "file_path", value: attachment.file_path },
                      { name: "project_id", value: project.id }
                    ]}
                    variant="ghost"
                    size="sm"
                  >
                    Delete
                  </ConfirmActionButton>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">No files uploaded yet for this project.</p>
          )}
          <AttachmentUploader projectId={project.id} />
        </Card>
      ) : null}
    </div>
  );
}
