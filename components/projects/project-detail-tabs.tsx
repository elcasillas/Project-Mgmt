"use client";

import { useMemo, useState } from "react";
import { addCommentAction, deleteAttachmentAction } from "@/lib/actions/workspace";
import { AttachmentUploader } from "@/components/shared/attachment-uploader";
import { AvatarGroup } from "@/components/ui/avatar-group";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, formatRelative } from "@/lib/utils/format";
import type { Attachment, Comment, Project, Task, ActivityLog } from "@/lib/types/domain";

type Tab = "Overview" | "Tasks" | "Team" | "Activity" | "Files";

export function ProjectDetailTabs({
  project,
  tasks,
  activity,
  comments,
  attachments
}: {
  project: Project;
  tasks: Task[];
  activity: ActivityLog[];
  comments: Comment[];
  attachments: Attachment[];
}) {
  const [tab, setTab] = useState<Tab>("Overview");
  const latestComments = useMemo(() => comments.slice(0, 8), [comments]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {(["Overview", "Tasks", "Team", "Activity", "Files"] as Tab[]).map((item) => (
          <Button key={item} variant={tab === item ? "primary" : "secondary"} size="sm" onClick={() => setTab(item)}>
            {item}
          </Button>
        ))}
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
            <div className="grid gap-3 md:grid-cols-2">
              {tasks.slice(0, 4).map((task) => (
                <div key={task.id} className="rounded-2xl border border-slate-100 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-slate-900">{task.title}</p>
                    <Badge value={task.status} />
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{task.assignee?.full_name ?? "Unassigned"}</p>
                </div>
              ))}
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
        <Card className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="flex flex-col gap-3 rounded-2xl border border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="font-medium text-slate-900">{task.title}</p>
                <p className="mt-1 text-sm text-slate-500">{task.description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge value={task.status} />
                <Badge value={task.priority} />
              </div>
            </div>
          ))}
        </Card>
      ) : null}

      {tab === "Team" ? (
        <Card className="space-y-4">
          {(project.members ?? []).map((member) => (
            <div key={member.id} className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
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
              <div key={attachment.id} className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
                <div>
                  <p className="font-medium text-slate-900">{attachment.file_name}</p>
                  <p className="text-sm text-slate-500">
                    Uploaded by {attachment.uploader?.full_name ?? "Unknown"} on {formatDate(attachment.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a className="text-sm font-medium text-sky-600" href={attachment.file_url} target="_blank" rel="noreferrer">
                    Open
                  </a>
                  <form action={deleteAttachmentAction}>
                    <input type="hidden" name="attachment_id" value={attachment.id} />
                    <input type="hidden" name="file_path" value={attachment.file_path} />
                    <input type="hidden" name="project_id" value={project.id} />
                    <Button variant="ghost" size="sm">
                      Delete
                    </Button>
                  </form>
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
