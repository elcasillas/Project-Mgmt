"use client";

import Link from "next/link";
import type { Route } from "next";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { LogOut, Menu, Search } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NAV_ITEMS } from "@/lib/data/constants";
import {
  normalizeSearchQuery,
  projectMatchesDescription,
  projectMatchesName,
  taskMatchesDescription,
  taskMatchesName
} from "@/lib/utils/search";
import type { Profile, Project, Task } from "@/lib/types/domain";

function getDescriptionExcerpt(description: string | null | undefined, query: string) {
  const source = (description ?? "").trim();
  if (!source) {
    return "";
  }

  const normalizedSource = source.toLowerCase();
  const index = normalizedSource.indexOf(query);
  if (index === -1) {
    return source.slice(0, 140);
  }

  const start = Math.max(0, index - 50);
  const end = Math.min(source.length, index + query.length + 90);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < source.length ? "..." : "";
  return `${prefix}${source.slice(start, end)}${suffix}`;
}

function SearchResults({
  submittedQuery,
  projects,
  tasks,
  onNavigate
}: {
  submittedQuery: string;
  projects: Project[];
  tasks: Task[];
  onNavigate: () => void;
}) {
  const results = useMemo(() => {
    const query = normalizeSearchQuery(submittedQuery);
    if (!query) {
      return null;
    }

    const matchingProjects = projects.filter((project) => projectMatchesName(project, query));
    const matchingTasks = tasks.filter((task) => taskMatchesName(task, query));
    const matchingDescriptions = [
      ...projects
        .filter((project) => projectMatchesDescription(project, query))
        .map((project) => ({
          id: `project-description-${project.id}`,
          type: "Project description" as const,
          title: project.name,
          href: `/projects/${project.id}` as Route,
          detail: getDescriptionExcerpt(project.description, query)
        })),
      ...tasks
        .filter((task) => taskMatchesDescription(task, query))
        .map((task) => ({
          id: `task-description-${task.id}`,
          type: "Task description" as const,
          title: task.title,
          href: `/tasks?task=${encodeURIComponent(task.id)}` as Route,
          detail: `${task.project?.name ?? "No project"} • ${getDescriptionExcerpt(task.description, query)}`
        }))
    ];

    return { query, matchingProjects, matchingTasks, matchingDescriptions };
  }, [projects, submittedQuery, tasks]);

  if (!results) {
    return null;
  }

  const hasResults =
    results.matchingProjects.length > 0 || results.matchingTasks.length > 0 || results.matchingDescriptions.length > 0;

  return (
    <div className="mt-3 rounded-[12px] border border-white/10 bg-[rgba(12,12,14,0.96)] p-4 shadow-soft">
      {hasResults ? (
        <div className="space-y-4">
          {results.matchingProjects.length ? (
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">Projects</p>
              <div className="space-y-2">
                {results.matchingProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}` as Route}
                    className="block rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10"
                    onClick={onNavigate}
                  >
                    <p className="text-sm font-medium text-white">{project.name}</p>
                    <p className="mt-1 text-xs text-white/55">Project name match</p>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {results.matchingTasks.length ? (
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">Tasks</p>
              <div className="space-y-2">
                {results.matchingTasks.map((task) => (
                  <Link
                    key={task.id}
                    href={`/tasks?task=${encodeURIComponent(task.id)}` as Route}
                    className="block rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10"
                    onClick={onNavigate}
                  >
                    <p className="text-sm font-medium text-white">{task.title}</p>
                    <p className="mt-1 text-xs text-white/55">{task.project?.name ?? "No project"} • Task name match</p>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {results.matchingDescriptions.length ? (
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">Description matches</p>
              <div className="space-y-2">
                {results.matchingDescriptions.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="block rounded-xl border border-white/10 bg-white/5 px-4 py-3 transition hover:bg-white/10"
                    onClick={onNavigate}
                  >
                    <p className="text-sm font-medium text-white">{item.title}</p>
                    <p className="mt-1 text-xs text-white/55">{item.type}</p>
                    <p className="mt-2 text-xs leading-5 text-white/72">{item.detail}</p>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-white/72">No results found</p>
      )}
    </div>
  );
}

function HeaderSearch({
  projects,
  tasks,
  mobile = false,
  onNavigate
}: {
  projects: Project[];
  tasks: Task[];
  mobile?: boolean;
  onNavigate: () => void;
}) {
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");

  const runSearch = () => {
    const normalized = normalizeSearchQuery(query);
    setQuery(normalized ? query : "");
    setSubmittedQuery(normalized);
  };

  return (
    <div className={mobile ? "space-y-3" : "relative"}>
      <form
        className="relative"
        onSubmit={(event) => {
          event.preventDefault();
          runSearch();
        }}
      >
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
        <Input
          value={query}
          onChange={(event) => {
            const nextValue = event.target.value;
            setQuery(nextValue);
            if (!normalizeSearchQuery(nextValue)) {
              setSubmittedQuery("");
            }
          }}
          className="border-white/10 bg-white/10 pl-11 pr-24 text-white placeholder:text-white/35"
          placeholder="Search projects, tasks, or descriptions"
        />
        <Button
          type="submit"
          variant="ghost"
          size="sm"
          className="absolute right-1.5 top-1/2 h-8 -translate-y-1/2 rounded-full border border-white/10 bg-white/10 px-3 text-white hover:bg-white/15 hover:text-white"
        >
          Search
        </Button>
      </form>
      <SearchResults submittedQuery={submittedQuery} projects={projects} tasks={tasks} onNavigate={onNavigate} />
    </div>
  );
}

export function Header({
  profile,
  workspaceName,
  projects,
  tasks
}: {
  profile: Profile | null;
  workspaceName: string;
  projects: Project[];
  tasks: Task[];
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[rgba(0,0,0,0.82)] backdrop-blur-[20px] backdrop-saturate-150">
      <div className="flex items-center gap-4 px-4 py-3 sm:px-6 lg:px-10">
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/6 text-white lg:hidden"
          onClick={() => setMobileOpen((value) => !value)}
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-[0.24em] text-white/45">{workspaceName}</p>
          <p className="truncate text-[21px] font-semibold tracking-[-0.02em] text-white">Project Delivery Command Center</p>
        </div>
        <div className="hidden max-w-md flex-1 lg:block">
          <HeaderSearch projects={projects} tasks={tasks} onNavigate={() => setMobileOpen(false)} />
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/10 text-sm font-semibold text-white">
          {profile?.full_name
            ?.split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2) ?? "PM"}
        </div>
        <form action={logoutAction} className="hidden sm:block">
          <Button
            variant="ghost"
            size="sm"
            className="h-11 w-11 border border-white/10 bg-white/6 px-0 text-white hover:bg-white/10 hover:text-white"
            aria-label="Logout"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </form>
      </div>
      {mobileOpen ? (
        <div className="space-y-3 border-t border-white/10 bg-black px-4 py-4 lg:hidden">
          <nav className="grid gap-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-3 text-sm font-medium ${
                  pathname.startsWith(item.href) ? "bg-white text-[#1d1d1f]" : "bg-white/6 text-white/72"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <HeaderSearch projects={projects} tasks={tasks} mobile onNavigate={() => setMobileOpen(false)} />
          <form action={logoutAction}>
            <Button
              variant="ghost"
              className="h-11 w-11 border border-white/10 bg-white/6 px-0 text-white hover:bg-white/10 hover:text-white"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
        </div>
      ) : null}
    </header>
  );
}
