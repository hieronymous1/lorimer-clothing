"use client";

import { createElement, useEffect, useRef } from "react";
import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

type RevealProps = {
  children?: ReactNode;
  /** clip = curtain wipe, fade = rise+fade, words = word-by-word (expects text children) */
  effect?: "clip" | "fade" | "words";
  as?: ElementType;
  className?: string;
  threshold?: number;
};

const effectClass = {
  clip: "rv-clip",
  fade: "rv-fade",
  words: "rv-words"
} as const;

export function Reveal({
  children,
  effect = "fade",
  as = "div",
  className,
  threshold = 0.2
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-inview");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold }
    );

    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);

  return createElement(
    as,
    { ref, className: cn(effectClass[effect], className) },
    effect === "words" ? <Words>{children}</Words> : children
  );
}

function Words({ children }: { children: ReactNode }) {
  if (typeof children !== "string") return <>{children}</>;

  return (
    <>
      {children.split(" ").map((word, i) => (
        <span key={i} className="rv-word inline-block">
          {word}
          {" "}
        </span>
      ))}
    </>
  );
}
