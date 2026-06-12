type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
};

export function SectionHeading({ eyebrow, title, description }: SectionHeadingProps) {
  return (
    <div className="space-y-3">
      <p className="meta-label">{eyebrow}</p>
      <h2 className="max-w-5xl text-balance text-[2.8rem] uppercase leading-[0.84] text-ink md:text-[4.5rem]">
        {title}
      </h2>
      {description ? <p className="max-w-3xl text-base leading-7 text-fog md:text-lg md:leading-8">{description}</p> : null}
    </div>
  );
}
