import { Card } from "@/components/ui/card";
import { formatRelative } from "@/lib/utils/format";
import type { ActivityLog } from "@/lib/types/domain";

export function RecentActivityFeed({ items }: { items: ActivityLog[] }) {
  return (
    <Card className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">Recent Activity</h2>
        <p className="text-sm text-slate-500">Latest project and task changes across the workspace.</p>
      </div>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3">
            <div className="mt-1 h-2.5 w-2.5 rounded-full bg-sky-500" />
            <div className="min-w-0">
              <p className="text-sm text-slate-700">
                <span className="font-semibold text-slate-950">{item.actor?.full_name ?? "Unknown user"}</span>{" "}
                {item.action.replaceAll("_", " ")}
              </p>
              <p className="text-xs text-slate-500">{formatRelative(item.created_at)}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
