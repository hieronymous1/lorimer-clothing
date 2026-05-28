type RouteLoadingProps = {
  eyebrow: string;
  title: string;
  blocks?: number;
};

export function RouteLoading({ eyebrow, title, blocks = 3 }: RouteLoadingProps) {
  return (
    <main className="page-shell animate-pulse pb-24">
      <section className="page-section space-y-6">
        <p className="text-[0.74rem] uppercase tracking-[0.18em] text-fog">{eyebrow}</p>
        <h1 className="max-w-4xl text-balance text-[2.5rem] leading-[0.95] text-ink md:text-[4rem]">
          {title}
        </h1>
        <div className="h-5 w-full max-w-2xl rounded-full bg-panel/70" />
        <div className="h-5 w-4/5 max-w-xl rounded-full bg-panel/50" />
      </section>

      <section className="page-section grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: blocks }).map((_, index) => (
          <div key={index} className="space-y-4">
            <div className="aspect-[0.78] bg-panel/70" />
            <div className="space-y-2">
              <div className="h-3 w-20 rounded-full bg-panel/60" />
              <div className="h-7 w-3/4 rounded-full bg-panel/70" />
              <div className="h-4 w-full rounded-full bg-panel/50" />
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
