"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { GanttDateRangeOption, GanttScale } from "@/lib/utils/gantt";
import type { Profile, Project, TaskStatus } from "@/lib/types/domain";

export function GanttToolbar({
  projects,
  profiles,
  query,
  onQueryChange,
  projectFilter,
  onProjectFilterChange,
  statusFilter,
  onStatusFilterChange,
  assigneeFilter,
  onAssigneeFilterChange,
  dateRange,
  onDateRangeChange,
  scale,
  onScaleChange
}: {
  projects: Project[];
  profiles: Profile[];
  query: string;
  onQueryChange: (value: string) => void;
  projectFilter: string;
  onProjectFilterChange: (value: string) => void;
  statusFilter: "All" | TaskStatus;
  onStatusFilterChange: (value: "All" | TaskStatus) => void;
  assigneeFilter: string;
  onAssigneeFilterChange: (value: string) => void;
  dateRange: GanttDateRangeOption;
  onDateRangeChange: (value: GanttDateRangeOption) => void;
  scale: GanttScale;
  onScaleChange: (value: GanttScale) => void;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="grid flex-1 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(240px,1.6fr)_minmax(170px,1fr)_minmax(170px,1fr)_minmax(170px,1fr)_minmax(170px,1fr)]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search task or project"
              className="pl-11"
            />
          </div>
          <Select value={projectFilter} onChange={(event) => onProjectFilterChange(event.target.value)}>
            <option value="All">All projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </Select>
          <Select value={statusFilter} onChange={(event) => onStatusFilterChange(event.target.value as "All" | TaskStatus)}>
            <option value="All">All statuses</option>
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Blocked">Blocked</option>
            <option value="In Review">In Review</option>
            <option value="Done">Done</option>
          </Select>
          <Select value={assigneeFilter} onChange={(event) => onAssigneeFilterChange(event.target.value)}>
            <option value="All">All assignees</option>
            {profiles.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.full_name}
              </option>
            ))}
          </Select>
          <Select value={dateRange} onChange={(event) => onDateRangeChange(event.target.value as GanttDateRangeOption)}>
            <option value="90d">Next 90 days</option>
            <option value="180d">Next 180 days</option>
            <option value="365d">Next 365 days</option>
            <option value="all">All scheduled work</option>
          </Select>
        </div>
        <div className="flex flex-wrap gap-2">
          {(["day", "week", "month"] as GanttScale[]).map((option) => (
            <Button
              key={option}
              type="button"
              variant={scale === option ? "primary" : "secondary"}
              size="sm"
              onClick={() => onScaleChange(option)}
            >
              {option[0].toUpperCase() + option.slice(1)}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
