import { Card } from "@/components/ui/card";
import type { DashboardMetrics } from "@/lib/types/domain";

export function StatusChart({ items }: { items: DashboardMetrics["tasksByStatus"] }) {
  const max = Math.max(...items.map((item) => item.count), 1);

  return (
    <Card className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">Task Status Mix</h2>
        <p className="text-sm text-slate-500">Current distribution across delivery stages.</p>
      </div>
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.status} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">{item.status}</span>
              <span className="text-slate-500">{item.count}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 to-teal-500"
                style={{ width: `${(item.count / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
