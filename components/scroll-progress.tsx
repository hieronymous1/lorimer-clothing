"use client";

import { useEffect, useRef } from "react";

import { addRaf, prefersReducedMotion } from "@/lib/raf";

export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const bar = barRef.current;
    if (!bar) return;

    let last = -1;
    const stop = addRaf(() => {
      const max = document.documentElement.scrollHeight - innerHeight;
      const p = max > 0 ? Math.min(scrollY / max, 1) : 0;
      if (Math.abs(p - last) > 0.001) {
        last = p;
        bar.style.transform = `scaleX(${p})`;
      }
    });

    return stop;
  }, []);

  return (
    <div
      ref={barRef}
      aria-hidden
      className="fixed left-0 top-0 z-[950] h-[2px] w-full origin-left bg-acid will-change-transform"
      style={{ transform: "scaleX(0)" }}
    />
  );
}
