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
      className={cn("rounded-2xl border border-gray-200 bg-white p-6", className)}
      {...props}
    >
      {children}
    </div>
  );
}
