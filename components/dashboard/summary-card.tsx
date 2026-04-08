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
    <Card className="space-y-3 bg-[#fbfbfd]">
      <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[rgba(29,29,31,0.48)]">{label}</p>
      <p className="text-[40px] font-semibold leading-[1.05] tracking-[-0.04em] text-[#1d1d1f]">{value}</p>
      <p className="text-[14px] leading-[1.43] tracking-[-0.01em] text-[rgba(29,29,31,0.56)]">{detail}</p>
    </Card>
  );
}
