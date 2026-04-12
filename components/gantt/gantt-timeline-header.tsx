import { format } from "date-fns";
import type { GanttScale, GanttTimelineSegment } from "@/lib/utils/gantt";

export function GanttTimelineHeader({
  monthSegments,
  scaleSegments,
  scale,
  timelineWidth
}: {
  monthSegments: GanttTimelineSegment[];
  scaleSegments: GanttTimelineSegment[];
  scale: GanttScale;
  timelineWidth: number;
}) {
  return (
    <div className="bg-white" style={{ width: timelineWidth }}>
      <div className="flex h-11 border-b border-slate-200 bg-white">
        {monthSegments.map((segment) => (
          <div
            key={segment.key}
            className="flex shrink-0 items-center border-r border-slate-200 px-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500"
            style={{ width: segment.width }}
          >
            {segment.label}
          </div>
        ))}
      </div>
      <div className="flex h-[44px] bg-slate-50/80">
        {scaleSegments.map((segment) => (
          <div
            key={segment.key}
            className="flex shrink-0 flex-col justify-center border-r border-slate-200 px-2 text-center"
            style={{ width: segment.width }}
          >
            <span className="text-[12px] font-semibold tracking-[-0.01em] text-slate-700">{segment.label}</span>
            <span className="text-[10px] uppercase tracking-[0.14em] text-slate-400">
              {scale === "day" ? segment.shortLabel : scale === "week" ? segment.shortLabel : format(segment.start, "yyyy")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
