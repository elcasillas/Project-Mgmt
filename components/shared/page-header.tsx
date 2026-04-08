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
      <div>
        {eyebrow ? <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[#0066cc]">{eyebrow}</p> : null}
        <h1 className="mt-2 max-w-4xl text-[40px] font-semibold leading-[1.08] tracking-[-0.03em] text-[#1d1d1f] sm:text-[48px]">{title}</h1>
        {description ? (
          <p className="mt-3 max-w-3xl text-[17px] leading-[1.47] tracking-[-0.01em] text-[rgba(29,29,31,0.72)]">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}
