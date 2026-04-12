import { GANTT_ROW_HEIGHT, getTaskBarMetrics, type GanttScale, type GanttScheduledTask } from "@/lib/utils/gantt";

export function GanttDependencyLines({
  tasks,
  timelineStart,
  timelineEnd,
  scale,
  timelineWidth
}: {
  tasks: GanttScheduledTask[];
  timelineStart: Date;
  timelineEnd: Date;
  scale: GanttScale;
  timelineWidth: number;
}) {
  const tasksById = new Map(tasks.map((task, index) => [task.id, { task, index }] as const));

  const lines = tasks.flatMap((task, index) =>
    (task.dependency_ids ?? []).flatMap((dependencyId) => {
      const dependencyEntry = tasksById.get(dependencyId);
      if (!dependencyEntry) {
        return [];
      }

      const source = getTaskBarMetrics(dependencyEntry.task, timelineStart, timelineEnd, scale);
      const target = getTaskBarMetrics(task, timelineStart, timelineEnd, scale);
      const sourceX = dependencyEntry.task.isMilestone ? source.left + source.width / 2 : source.left + source.width;
      const targetX = task.isMilestone ? target.left + target.width / 2 : target.left;
      const sourceY = dependencyEntry.index * GANTT_ROW_HEIGHT + GANTT_ROW_HEIGHT / 2;
      const targetY = index * GANTT_ROW_HEIGHT + GANTT_ROW_HEIGHT / 2;
      const elbowX = Math.max(sourceX + 26, targetX - 26);

      return [
        {
          key: `${dependencyId}-${task.id}`,
          path: `M ${sourceX} ${sourceY} L ${elbowX} ${sourceY} L ${elbowX} ${targetY} L ${targetX} ${targetY}`
        }
      ];
    })
  );

  return (
    <svg className="pointer-events-none absolute inset-0 z-10" width={timelineWidth} height={tasks.length * GANTT_ROW_HEIGHT}>
      <defs>
        <marker id="gantt-arrow-head" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="#94a3b8" />
        </marker>
      </defs>
      {lines.map((line) => (
        <path
          key={line.key}
          d={line.path}
          fill="none"
          stroke="#94a3b8"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          markerEnd="url(#gantt-arrow-head)"
          opacity="0.95"
        />
      ))}
    </svg>
  );
}
