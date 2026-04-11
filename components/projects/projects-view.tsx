"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Archive } from "lucide-react";
import { archiveProjectAction } from "@/lib/actions/workspace";
import { ConfirmActionButton } from "@/components/shared/confirm-action-button";
import { ProjectFormModal } from "@/components/projects/project-form-modal";
import { AvatarGroup } from "@/components/ui/avatar-group";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Select } from "@/components/ui/select";
import { formatDate } from "@/lib/utils/format";
import type { Profile, Project } from "@/lib/types/domain";

type ViewMode = "grid" | "table";

export function ProjectsView({
  projects,
  profiles,
  canManageProjects
}: {
  projects: Project[];
  profiles: Profile[];
  canManageProjects: boolean;
}) {
  const [view, setView] = useState<ViewMode>("grid");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [priority, setPriority] = useState("All");
  const projectActionButtonClassName =
    "h-9 w-9 rounded-md border border-gray-200 bg-transparent p-0 text-slate-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#00ADB1]";

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesQuery =
        !query ||
        project.name.toLowerCase().includes(query.toLowerCase()) ||
        project.description?.toLowerCase().includes(query.toLowerCase()) ||
        project.tags?.some((tag) => tag.name.toLowerCase().includes(query.toLowerCase()));
      const matchesStatus = status === "All" || project.status === status;
      const matchesPriority = priority === "All" || project.priority === priority;
      return matchesQuery && matchesStatus && matchesPriority;
    });
  }, [projects, query, status, priority]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 md:flex-row">
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search projects and descriptions" />
          <Select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option>All</option>
            <option>Planning</option>
            <option>Active</option>
            <option>On Hold</option>
            <option>Completed</option>
            <option>Cancelled</option>
          </Select>
          <Select value={priority} onChange={(event) => setPriority(event.target.value)}>
            <option>All</option>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Critical</option>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant={view === "grid" ? "primary" : "secondary"} size="sm" onClick={() => setView("grid")}>
            Grid
          </Button>
          <Button variant={view === "table" ? "primary" : "secondary"} size="sm" onClick={() => setView("table")}>
            Table
          </Button>
          {canManageProjects ? <ProjectFormModal profiles={profiles} triggerSize="sm" /> : null}
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid gap-5 xl:grid-cols-3">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Link href={`/projects/${project.id}`} className="text-lg font-semibold text-slate-950">
                    {project.name}
                  </Link>
                  <p className="mt-2 text-sm text-slate-500">{project.description}</p>
                </div>
                <Badge value={project.priority} />
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge value={project.status} />
                {project.tags?.map((tag) => (
                  <span key={tag.id} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    {tag.name}
                  </span>
                ))}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Progress</span>
                  <span className="font-medium text-slate-900">{project.progress}%</span>
                </div>
                <Progress value={project.progress} />
              </div>
              <div className="flex items-center justify-between">
                <AvatarGroup users={project.members ?? []} />
                <p className="text-xs text-slate-500">Target {formatDate(project.target_end_date)}</p>
              </div>
              <div className="flex gap-2">
                {canManageProjects ? (
                  <ProjectFormModal
                    profiles={profiles}
                    project={project}
                    triggerLabel="Edit"
                    triggerAriaLabel="Edit Project"
                    triggerTitle="Edit Project"
                    triggerIconOnly
                    triggerSize="sm"
                  />
                ) : null}
                {canManageProjects ? (
                  <ConfirmActionButton
                    action={archiveProjectAction}
                    fields={[{ name: "project_id", value: project.id }]}
                    variant="ghost"
                    size="sm"
                    className={projectActionButtonClassName}
                    aria-label="Archive Project"
                    title="Archive Project"
                  >
                    <Archive className="h-4 w-4" />
                  </ConfirmActionButton>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Project</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Priority</th>
                  <th className="px-6 py-4 font-medium">Owner</th>
                  <th className="px-6 py-4 font-medium">Progress</th>
                  <th className="px-6 py-4 font-medium">End date</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProjects.map((project) => (
                  <tr key={project.id}>
                    <td className="px-6 py-4">
                      <Link href={`/projects/${project.id}`} className="font-medium text-slate-950">
                        {project.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4"><Badge value={project.status} /></td>
                    <td className="px-6 py-4"><Badge value={project.priority} /></td>
                    <td className="px-6 py-4 text-slate-600">{project.owner?.full_name ?? "Unknown"}</td>
                    <td className="px-6 py-4">
                      <div className="max-w-[180px] space-y-2">
                        <Progress value={project.progress} />
                        <p className="text-xs text-slate-500">{project.progress}% complete</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{formatDate(project.target_end_date)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {canManageProjects ? (
                          <ProjectFormModal
                            profiles={profiles}
                            project={project}
                            triggerLabel="Edit"
                            triggerAriaLabel="Edit Project"
                            triggerTitle="Edit Project"
                            triggerIconOnly
                            triggerSize="sm"
                          />
                        ) : null}
                        {canManageProjects ? (
                          <ConfirmActionButton
                            action={archiveProjectAction}
                            fields={[{ name: "project_id", value: project.id }]}
                            variant="ghost"
                            size="sm"
                            className={projectActionButtonClassName}
                            aria-label="Archive Project"
                            title="Archive Project"
                          >
                            <Archive className="h-4 w-4" />
                          </ConfirmActionButton>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
