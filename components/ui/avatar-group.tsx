import { cn } from "@/lib/utils/cn";
import type { Profile } from "@/lib/types/domain";

export function AvatarGroup({ users, limit = 4 }: { users: Profile[]; limit?: number }) {
  const visible = users.slice(0, limit);
  const extra = users.length - visible.length;

  return (
    <div className="flex items-center">
      {visible.map((user, index) => (
        <div
          key={user.id}
          className={cn(
            "-ml-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-xs font-semibold text-slate-700 first:ml-0"
          )}
          style={{ zIndex: visible.length - index }}
          title={user.full_name}
        >
          {user.full_name
            .split(" ")
            .map((part) => part[0])
            .join("")
            .slice(0, 2)}
        </div>
      ))}
      {extra > 0 ? (
        <div className="-ml-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-sky-50 text-xs font-semibold text-sky-700">
          +{extra}
        </div>
      ) : null}
    </div>
  );
}
