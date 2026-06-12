"use client";

import { useEffect, useRef } from "react";

import { addRaf, isFinePointer, lerp, prefersReducedMotion } from "@/lib/raf";

/**
 * Dot + trailing ring cursor in mix-blend difference. Elements opt into a
 * contextual label with data-cursor="VIEW" — delegation-based, so it keeps
 * working across route changes without re-binding.
 */
export function SiteCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!isFinePointer() || prefersReducedMotion()) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!dot || !ring || !label) return;

    document.documentElement.classList.add("lorimer-cursor");
    dot.style.opacity = "0";
    ring.style.opacity = "0";

    let tx = innerWidth / 2;
    let ty = innerHeight / 2;
    let dx = tx;
    let dy = ty;
    let rx = tx;
    let ry = ty;
    let seen = false;

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!seen) {
        seen = true;
        dx = rx = tx;
        dy = ry = ty;
        dot.style.opacity = "1";
        ring.style.opacity = "1";
      }
    };

    const onOver = (e: MouseEvent) => {
      const hit = (e.target as Element | null)?.closest?.("[data-cursor]");
      if (hit) {
        label.textContent = hit.getAttribute("data-cursor") ?? "";
        ring.classList.add("cursor-ring-active");
      }
    };

    const onOut = (e: MouseEvent) => {
      const from = (e.target as Element | null)?.closest?.("[data-cursor]");
      const to = (e.relatedTarget as Element | null)?.closest?.("[data-cursor]");
      if (from && from !== to) ring.classList.remove("cursor-ring-active");
    };

    const stop = addRaf(() => {
      dx = lerp(dx, tx, 0.6);
      dy = lerp(dy, ty, 0.6);
      rx = lerp(rx, tx, 0.16);
      ry = lerp(ry, ty, 0.16);
      dot.style.transform = `translate3d(${dx}px, ${dy}px, 0) translate(-50%, -50%)`;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;
    });

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, true);
    document.addEventListener("mouseout", onOut, true);

    return () => {
      stop();
      document.documentElement.classList.remove("lorimer-cursor");
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver, true);
      document.removeEventListener("mouseout", onOut, true);
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-[6px] w-[6px] rounded-full bg-white mix-blend-difference will-change-transform"
      />
      <div
        ref={ringRef}
        aria-hidden
        className="cursor-ring pointer-events-none fixed left-0 top-0 z-[9998] flex h-9 w-9 items-center justify-center rounded-full border border-white mix-blend-difference will-change-transform [transition:width_.35s,height_.35s,background-color_.35s] [&.cursor-ring-active]:h-[74px] [&.cursor-ring-active]:w-[74px] [&.cursor-ring-active]:bg-white"
      >
        <span
          ref={labelRef}
          className="font-mono text-[8.5px] uppercase tracking-meta text-black opacity-0 transition-opacity duration-200 [.cursor-ring-active_&]:opacity-100"
        />
      </div>
    </>
  );
}
