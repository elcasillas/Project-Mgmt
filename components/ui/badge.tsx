import { cn } from "@/lib/utils/cn";
import { getStatusTone } from "@/lib/utils/status-colors";

export function Badge({ value, className }: { value: string; className?: string }) {
  const tone = getStatusTone(value);

  return (
    <span
      className={cn("inline-flex rounded-full px-3 py-1 text-[12px] font-semibold tracking-[-0.01em]", className)}
      style={{
        backgroundColor: tone.background,
        color: tone.foreground
      }}
    >
      {value}
    </span>
  );
}
