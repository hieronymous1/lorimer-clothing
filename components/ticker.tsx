import { Fragment } from "react";

type TickerProps = {
  items: string[];
  /** Highlighted (acid) entries, matched by value */
  accents?: string[];
};

export function Ticker({ items, accents = [] }: TickerProps) {
  const run = (
    <div className="flex w-max shrink-0 items-center" aria-hidden>
      {items.map((item, i) => (
        <Fragment key={i}>
          <span
            className={
              accents.includes(item)
                ? "bg-acid px-2 font-mono text-[0.7rem] uppercase tracking-meta text-ink"
                : "font-mono text-[0.7rem] uppercase tracking-meta"
            }
          >
            {item}
          </span>
          <span className="px-4 font-mono text-[0.7rem]">—</span>
        </Fragment>
      ))}
    </div>
  );

  return (
    <div
      className="overflow-hidden border-y border-ink py-[10px] hover:[&>div]:[animation-play-state:paused]"
      role="marquee"
      aria-label={items.join(" — ")}
    >
      <div className="flex w-max animate-[ticker_28s_linear_infinite] motion-reduce:animate-none">
        {run}
        {run}
      </div>
      <style>{`@keyframes ticker { to { transform: translateX(-50%); } }`}</style>
    </div>
  );
}
