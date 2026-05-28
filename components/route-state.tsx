import Link from "next/link";

type RouteStateAction = {
  href: string;
  label: string;
};

type RouteStateProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: RouteStateAction[];
  inset?: boolean;
};

export function RouteState({
  eyebrow,
  title,
  description,
  actions = [],
  inset = false
}: RouteStateProps) {
  return (
    <section className={inset ? "border border-line/80 bg-panel/40 p-8 md:p-10" : "space-y-6"}>
      <p className="text-[0.74rem] uppercase tracking-[0.18em] text-fog">{eyebrow}</p>
      <h2 className="max-w-4xl text-balance text-[2rem] leading-[0.95] text-ink md:text-[3rem]">
        {title}
      </h2>
      <p className="editorial-copy">{description}</p>
      {actions.length ? (
        <div className="flex flex-wrap gap-6 text-[0.82rem] uppercase tracking-[0.18em]">
          {actions.map((action) => (
            <Link
              key={`${action.href}-${action.label}`}
              href={action.href}
              className="border-b border-ink pb-1 transition hover:opacity-70"
            >
              {action.label}
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}
