export function PageHeader({
  eyebrow,
  title,
  description,
  actions
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        {eyebrow ? <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#0066cc]">{eyebrow}</p> : null}
        <h1 className="mt-2 max-w-4xl break-words text-[32px] font-semibold leading-[1.08] tracking-[-0.03em] text-[#1d1d1f] sm:text-[40px] lg:text-[48px]">{title}</h1>
        {description ? (
          <p className="mt-3 max-w-3xl text-[15px] leading-[1.47] tracking-[-0.01em] text-[rgba(29,29,31,0.72)] sm:text-[17px]">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3 max-sm:w-full">{actions}</div> : null}
    </div>
  );
}
