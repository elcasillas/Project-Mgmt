import { cn } from "@/lib/utils/cn";

const toneMap: Record<string, string> = {
  Active: "bg-sky-100 text-sky-700",
  Planning: "bg-slate-100 text-slate-700",
  "On Hold": "bg-amber-100 text-amber-700",
  Completed: "bg-emerald-100 text-emerald-700",
  Cancelled: "bg-rose-100 text-rose-700",
  "Not Started": "bg-slate-100 text-slate-700",
  "In Progress": "bg-sky-100 text-sky-700",
  Blocked: "bg-rose-100 text-rose-700",
  "In Review": "bg-violet-100 text-violet-700",
  Done: "bg-emerald-100 text-emerald-700",
  Low: "bg-slate-100 text-slate-700",
  Medium: "bg-amber-100 text-amber-700",
  High: "bg-orange-100 text-orange-700",
  Critical: "bg-rose-100 text-rose-700",
  Urgent: "bg-rose-100 text-rose-700",
  Admin: "bg-sky-100 text-sky-700",
  Manager: "bg-emerald-100 text-emerald-700",
  Member: "bg-slate-100 text-slate-700"
};

export function Badge({ value, className }: { value: string; className?: string }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", toneMap[value] ?? "bg-slate-100 text-slate-700", className)}>
      {value}
    </span>
  );
}
