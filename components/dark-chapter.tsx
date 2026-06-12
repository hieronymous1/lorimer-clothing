"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

import { addRaf, prefersReducedMotion } from "@/lib/raf";
import { cn } from "@/lib/utils";

type DarkChapterProps = {
  image: { src: string; alt: string };
  children: ReactNode;
  className?: string;
};

/**
 * Full-bleed coal section with a slow parallax drift on its backdrop.
 * Wrap content that should sit centered over the night photography.
 */
export function DarkChapter({ image, children, className }: DarkChapterProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const section = sectionRef.current;
    const bg = bgRef.current;
    if (!section || !bg) return;

    const stop = addRaf(() => {
      const rect = section.getBoundingClientRect();
      if (rect.top > innerHeight || rect.bottom < 0) return;
      const drift = (rect.top / rect.height) * 12;
      bg.style.transform = `translate3d(0, ${drift.toFixed(2)}%, 0)`;
    });

    return stop;
  }, []);

  return (
    <section
      ref={sectionRef}
      className={cn("dark-chapter relative overflow-hidden bg-coal text-paper", className)}
    >
      <div ref={bgRef} className="absolute -inset-y-[12%] inset-x-0 will-change-transform">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="100vw"
          className="object-cover opacity-55"
        />
      </div>
      <div className="relative">{children}</div>
    </section>
  );
}
