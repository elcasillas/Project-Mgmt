import { cn } from "@/lib/utils/cn";

export function Progress({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-2.5 w-full overflow-hidden rounded-full bg-[rgba(29,29,31,0.08)]", className)}>
      <div className="h-full rounded-full bg-[#0071e3]" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}
