import { cn } from "@/lib/utils/cn";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-[11px] border border-[rgba(29,29,31,0.08)] bg-[#fafafc] px-4 text-[17px] tracking-[-0.01em] text-[#1d1d1f] outline-none transition placeholder:text-[rgba(29,29,31,0.48)] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20",
        className
      )}
      {...props}
    />
  );
}
