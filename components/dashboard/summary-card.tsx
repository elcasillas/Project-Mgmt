import { Card } from "@/components/ui/card";

export function SummaryCard({
  label,
  value,
  detail
}: {
  label: string;
  value: string | number;
  detail: string;
}) {
  return (
    <Card className="space-y-3">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="text-sm text-slate-500">{detail}</p>
    </Card>
  );
}
