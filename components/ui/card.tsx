import { cn } from "@/lib/utils/cn";

export function Card({
  className,
  children,
  ...props
}: {
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-[8px] bg-[var(--app-surface)] p-6 shadow-card", className)}
      {...props}
    >
      {children}
    </div>
  );
}
