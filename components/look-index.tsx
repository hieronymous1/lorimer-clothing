"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { addRaf, isFinePointer, lerp, prefersReducedMotion } from "@/lib/raf";

export type LookIndexItem = {
  href: string;
  no: string;
  name: string;
  meta: string;
  status: string;
  image: { src: string; alt: string };
};

/**
 * Archive index rows with the floating "peek" plate that trails the
 * cursor — the signature browse interaction of the record.
 */
export function LookIndex({ items }: { items: LookIndexItem[] }) {
  const peekRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    if (!isFinePointer() || prefersReducedMotion()) return;
    const peek = peekRef.current;
    if (!peek) return;

    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let seeded = false;

    const onMove = (e: MouseEvent) => {
      tx = e.clientX + 150;
      ty = e.clientY;
      if (!seeded) {
        seeded = true;
        x = tx;
        y = ty;
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    const stop = addRaf(() => {
      x = lerp(x, tx, 0.14);
      y = lerp(y, ty, 0.14);
      peek.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
    });

    return () => {
      stop();
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <div onMouseLeave={() => setActive(null)}>
      {items.map((item, i) => (
        <Link
          key={item.href + item.no}
          href={item.href}
          data-cursor="VIEW"
          onMouseEnter={() => setActive(i)}
          className="group relative grid grid-cols-[64px_1fr] items-baseline gap-4 border-t border-line py-5 pl-1.5 transition-[padding-left] duration-500 ease-editorial last:border-b hover:pl-7 md:grid-cols-[90px_1fr_auto_auto] md:gap-7 md:py-6"
        >
          <span className="absolute left-0 top-0 h-full w-0 bg-ink transition-[width] duration-500 ease-editorial group-hover:w-[7px]" />
          <span className="font-mono text-[0.7rem] tracking-meta text-fog">{item.no}</span>
          <span className="editorial-wide text-[clamp(1.1rem,2.4vw,1.9rem)] leading-none">
            {item.name}
          </span>
          <span className="meta-label hidden text-fog md:block">{item.meta}</span>
          <span className="state-chip justify-self-start md:justify-self-end">{item.status}</span>
        </Link>
      ))}

      {/* floating peek plate */}
      <div
        ref={peekRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[700] hidden aspect-[2/3] w-[230px] overflow-hidden transition-[opacity,scale,rotate] duration-300 ease-editorial md:block"
        style={{
          opacity: active === null ? 0 : 1,
          scale: active === null ? "0.88" : "1",
          rotate: active === null ? "-3deg" : "0deg"
        }}
      >
        {items.map((item, i) => (
          <Image
            key={item.image.src + i}
            src={item.image.src}
            alt=""
            fill
            sizes="230px"
            className="object-cover transition-opacity duration-200"
            style={{ opacity: active === i ? 1 : 0 }}
          />
        ))}
        {active !== null && (
          <span className="absolute bottom-2 left-2 bg-paper px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-meta text-ink">
            {items[active].no}
          </span>
        )}
      </div>
    </div>
  );
}
