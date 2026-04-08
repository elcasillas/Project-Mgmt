import { cn } from "@/lib/utils/cn";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-[11px] border border-[rgba(29,29,31,0.08)] bg-[#fafafc] px-4 text-[17px] tracking-[-0.01em] text-[#1d1d1f] outline-none transition focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
