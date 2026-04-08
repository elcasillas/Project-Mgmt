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
      className={cn("rounded-3xl border border-white/70 bg-white/90 p-6 shadow-card backdrop-blur", className)}
      {...props}
    >
      {children}
    </div>
  );
}
