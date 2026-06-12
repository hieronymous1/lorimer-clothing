"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { LogoMark } from "@/components/logo-slices";
import type { AssetImage } from "@/lib/types";

const SESSION_KEY = "lorimer-preloader-shown";
const FLICKER_MS = 110;
const FLICKER_UNTIL = 1350;
const CURTAIN_AT = 2050;
const DONE_AT = 2900;

type PreloaderProps = {
  frames: AssetImage[];
};

/**
 * Contact-sheet entrance: look frames flicker in a small plate while the
 * counter runs, the wordmark rises, then the paper splits like a curtain.
 * Plays once per session; skipped entirely under reduced motion.
 */
export function Preloader({ frames }: PreloaderProps) {
  const [phase, setPhase] = useState<"idle" | "running" | "curtain" | "done">("idle");
  const [frame, setFrame] = useState(0);
  const [count, setCount] = useState(1);
  const total = Math.max(frames.length, 1);
  const countRef = useRef(1);

  useEffect(() => {
    if (
      sessionStorage.getItem(SESSION_KEY) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setPhase("done");
      return;
    }

    setPhase("running");
    sessionStorage.setItem(SESSION_KEY, "1");
    document.documentElement.style.overflow = "hidden";

    const flicker = setInterval(() => {
      setFrame((f) => (f + 1) % total);
      countRef.current = (countRef.current % total) + 1;
      setCount(countRef.current);
    }, FLICKER_MS);

    const stopFlicker = setTimeout(() => clearInterval(flicker), FLICKER_UNTIL);
    const curtain = setTimeout(() => setPhase("curtain"), CURTAIN_AT);
    const done = setTimeout(() => {
      setPhase("done");
      document.documentElement.style.overflow = "";
    }, DONE_AT);

    return () => {
      clearInterval(flicker);
      clearTimeout(stopFlicker);
      clearTimeout(curtain);
      clearTimeout(done);
      document.documentElement.style.overflow = "";
    };
  }, [total]);

  if (phase === "done" || phase === "idle") return null;

  const curtain = phase === "curtain";

  return (
    <div aria-hidden className="fixed inset-0 z-[1000]">
      {/* curtain panels */}
      <div
        className="absolute inset-x-0 top-0 h-1/2 bg-paper transition-transform duration-[850ms] ease-editorial"
        style={{ transform: curtain ? "translateY(-101%)" : "none" }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-1/2 bg-paper transition-transform duration-[850ms] ease-editorial"
        style={{ transform: curtain ? "translateY(101%)" : "none" }}
      />

      {/* center content */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-7 transition-opacity duration-300"
        style={{ opacity: curtain ? 0 : 1 }}
      >
        <div className="relative aspect-[2/3] w-[120px] overflow-hidden bg-line/60 md:w-[150px]">
          {frames.map((img, i) => (
            <Image
              key={img.src}
              src={img.src}
              alt=""
              fill
              priority
              sizes="150px"
              className="object-cover"
              style={{ opacity: i === frame ? 1 : 0 }}
            />
          ))}
          <span className="absolute bottom-1.5 left-1.5 bg-paper px-1.5 py-0.5 font-mono text-[8px] uppercase tracking-meta">
            LOOK_{String(count).padStart(2, "0")}
          </span>
        </div>

        <div className="w-[min(58vw,560px)] overflow-hidden">
          <div className="animate-[logoRise_1s_cubic-bezier(0.77,0,0.18,1)_0.2s_both]">
            <LogoMark />
          </div>
        </div>

        <div className="flex items-baseline gap-3 font-mono text-[11px] uppercase tracking-meta">
          <span>LOOK_{String(count).padStart(2, "0")}</span>
          <span className="text-fog">/ {String(total).padStart(2, "0")}</span>
        </div>

        <div className="h-px w-[min(58vw,560px)] bg-line">
          <div
            className="h-full bg-acid transition-[width] duration-200 ease-linear"
            style={{ width: `${(count / total) * 100}%` }}
          />
        </div>
      </div>

      <style>{`@keyframes logoRise { from { transform: translateY(110%); } to { transform: translateY(0); } }`}</style>
    </div>
  );
}
