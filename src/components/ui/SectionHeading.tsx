interface SectionHeadingProps {
  indexLabel: string;
  title: string;
  description?: string;
}

export function SectionHeading({
  indexLabel,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div className="max-w-2xl">
      <p className="font-mono text-xs font-medium tracking-[0.12em] uppercase text-[#38BDF8]">
        {indexLabel}
      </p>
      <h2 className="mt-3 text-[clamp(1.75rem,3vw,2.75rem)] font-bold leading-[1.15] text-[#F8FAFC]">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-base leading-[1.65] text-[#94A3B8]">
          {description}
        </p>
      ) : null}
    </div>
  );
}
