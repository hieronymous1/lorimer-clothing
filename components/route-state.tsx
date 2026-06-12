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
    <section className={inset ? "border border-line bg-panel p-8 md:p-10" : "space-y-6"}>
      <p className="meta-label">{eyebrow}</p>
      <h2 className="max-w-4xl text-balance text-[2.4rem] uppercase leading-[0.88] text-ink md:text-[3.5rem]">
        {title}
      </h2>
      <p className="editorial-copy">{description}</p>
      {actions.length ? (
        <div className="flex flex-wrap gap-6 text-[0.82rem] uppercase tracking-[0.18em]">
          {actions.map((action) => (
            <Link
              key={`${action.href}-${action.label}`}
              href={action.href}
              className="archive-link"
            >
              {action.label}
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}
