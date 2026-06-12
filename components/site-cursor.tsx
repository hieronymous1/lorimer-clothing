"use client";

import { useEffect, useRef } from "react";

export function SiteCursor() {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const dot = dotRef.current;
    if (!dot) return;

    let raf: number;
    let x = -100;
    let y = -100;
    let tx = -100;
    let ty = -100;

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
    };

    const animate = () => {
      x += (tx - x) * 0.18;
      y += (ty - y) * 0.18;
      dot.style.transform = `translate(${x}px, ${y}px)`;
      raf = requestAnimationFrame(animate);
    };

    const onEnterProduct = () => dot.classList.add("scale-[3]", "opacity-100");
    const onLeaveProduct = () => dot.classList.remove("scale-[3]", "opacity-100");

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(animate);

    document.querySelectorAll("[data-cursor-expand]").forEach((el) => {
      el.addEventListener("mouseenter", onEnterProduct);
      el.addEventListener("mouseleave", onLeaveProduct);
    });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.querySelectorAll("[data-cursor-expand]").forEach((el) => {
        el.removeEventListener("mouseenter", onEnterProduct);
        el.removeEventListener("mouseleave", onLeaveProduct);
      });
    };
  }, []);

  return (
    <div
      ref={dotRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[9998] h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ink opacity-60 transition-[transform,opacity] duration-300 ease-out will-change-transform"
      style={{ marginLeft: "-4px", marginTop: "-4px" }}
    />
  );
}
