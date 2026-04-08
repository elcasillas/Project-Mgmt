import { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
};

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "border border-transparent bg-[#0071e3] text-white hover:bg-[#0077ed]",
  secondary: "border border-[rgba(0,102,204,0.9)] bg-transparent text-[#0066cc] hover:bg-[rgba(0,102,204,0.06)]",
  ghost: "border border-transparent bg-transparent text-[rgba(29,29,31,0.72)] hover:bg-[rgba(29,29,31,0.06)] hover:text-[#1d1d1f]",
  danger: "border border-transparent bg-[#d70015] text-white hover:bg-[#bf0013]"
};

const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-9 px-4 text-[14px]",
  md: "h-11 px-5 text-[17px]"
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-full font-normal tracking-[-0.01em] transition focus:outline-none focus:ring-2 focus:ring-[#0071e3] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
});
