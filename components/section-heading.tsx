type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="space-y-3">
      <p className="text-[0.74rem] uppercase tracking-[0.18em] text-fog">{eyebrow}</p>
      <h2 className="max-w-4xl text-balance text-[2rem] leading-[0.95] text-ink md:text-[3rem]">
        {title}
      </h2>
      {description ? <p className="max-w-3xl text-lg leading-8 text-fog">{description}</p> : null}
    </div>
  );
}
