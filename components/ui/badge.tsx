import { cn } from "@/lib/utils/cn";

const toneMap: Record<string, string> = {
  Active: "bg-[#e8f3ff] text-[#0066cc]",
  Planning: "bg-[rgba(29,29,31,0.08)] text-[rgba(29,29,31,0.72)]",
  "On Hold": "bg-[#fff1d6] text-[#9b6500]",
  Completed: "bg-[#e7f5ea] text-[#0f7a2a]",
  Cancelled: "bg-[#ffe8eb] text-[#b00020]",
  "Not Started": "bg-[rgba(29,29,31,0.08)] text-[rgba(29,29,31,0.72)]",
  "In Progress": "bg-[#e8f3ff] text-[#0066cc]",
  Blocked: "bg-[#ffe8eb] text-[#b00020]",
  "In Review": "bg-[#edf1ff] text-[#4455c7]",
  Done: "bg-[#e7f5ea] text-[#0f7a2a]",
  Low: "bg-[rgba(29,29,31,0.08)] text-[rgba(29,29,31,0.72)]",
  Medium: "bg-[#fff1d6] text-[#9b6500]",
  High: "bg-[#ffe8d5] text-[#b65a00]",
  Critical: "bg-[#ffe8eb] text-[#b00020]",
  Urgent: "bg-[#ffe8eb] text-[#b00020]",
  Admin: "bg-[#e8f3ff] text-[#0066cc]",
  "Project Manager": "bg-[#e7f5ea] text-[#0f7a2a]",
  "Team Member": "bg-[rgba(29,29,31,0.08)] text-[rgba(29,29,31,0.72)]",
  Viewer: "bg-[#edf1ff] text-[#4455c7]",
  Inactive: "bg-[rgba(29,29,31,0.12)] text-[rgba(29,29,31,0.56)]",
  Pending: "bg-[#fff1d6] text-[#9b6500]"
};

export function Badge({ value, className }: { value: string; className?: string }) {
  return (
    <span className={cn("inline-flex rounded-full px-3 py-1 text-[12px] font-semibold tracking-[-0.01em]", toneMap[value] ?? "bg-[rgba(29,29,31,0.08)] text-[rgba(29,29,31,0.72)]", className)}>
      {value}
    </span>
  );
}
