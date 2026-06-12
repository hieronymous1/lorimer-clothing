"use client";

import { useEffect, useMemo, useRef } from "react";

import { addRaf, isFinePointer, lerp, prefersReducedMotion } from "@/lib/raf";
import { cn } from "@/lib/utils";

const LOGO_SRC = "/assets/FINAL%20PICS%20WEBSITE/Lorimer%20final%20logo_Lorimer%201%20black.png";
/** Native logo dimensions: 1391 × 179 */
export const LOGO_RATIO = "1391 / 179";

type LogoSlicesProps = {
  slices?: number;
  /** Max ripple displacement in px */
  amplitude?: number;
  /** Invert to white (for dark chapters) */
  inverted?: boolean;
  /** Enable the click glitch burst */
  glitch?: boolean;
  className?: string;
};

/**
 * The LORIMER® wordmark cut into vertical slices. Idle: a slow sine
 * breath travels through the strips. Cursor: a gaussian ripple follows
 * proximity. Click: a glitch burst scatters the slices (random offsets +
 * invert flashes) before they settle home. Engine pauses offscreen and
 * collapses to a plain <img> under reduced motion / coarse pointers.
 */
export function LogoSlices({
  slices = 18,
  amplitude = 26,
  inverted = false,
  glitch = true,
  className
}: LogoSlicesProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ glitchUntil: 0, lastShuffle: 0 });
  const indices = useMemo(() => Array.from({ length: slices }, (_, i) => i), [slices]);

  useEffect(() => {
    if (!isFinePointer() || prefersReducedMotion()) return;

    const wrap = wrapRef.current;
    if (!wrap) return;
    const els = Array.from(wrap.children) as HTMLDivElement[];
    const ys = els.map(() => 0);
    const targets = els.map(() => 0);
    const jitter = els.map(() => 0);
    let mouseX = -1e5;
    let visible = true;
    let stop: (() => void) | null = null;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
    };
    const onLeave = () => {
      mouseX = -1e5;
    };
    const onClick = () => {
      if (!glitch) return;
      stateRef.current.glitchUntil = performance.now() + 550;
    };

    const frame = (time: number) => {
      if (!visible) return;
      const rect = wrap.getBoundingClientRect();
      const glitching = time < stateRef.current.glitchUntil;

      if (glitching && time - stateRef.current.lastShuffle > 55) {
        stateRef.current.lastShuffle = time;
        for (let i = 0; i < els.length; i++) {
          jitter[i] = (Math.random() - 0.5) * amplitude * 3.2;
          els[i].style.filter = Math.random() < 0.22 ? "invert(1)" : "";
        }
      }

      for (let i = 0; i < els.length; i++) {
        const center = rect.left + (rect.width * (i + 0.5)) / els.length;
        const d = (center - mouseX) / 110;
        const ripple = -Math.exp(-d * d) * amplitude;
        const breath = Math.sin(time / 900 + i * 0.45) * 2.2;
        targets[i] = glitching ? jitter[i] : ripple + breath;
        ys[i] = lerp(ys[i], targets[i], glitching ? 0.5 : 0.12);
        els[i].style.transform = `translate3d(0, ${ys[i].toFixed(2)}px, 0)`;
        if (!glitching && els[i].style.filter) els[i].style.filter = "";
      }
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !stop) {
        stop = addRaf(frame);
      } else if (!visible && stop) {
        stop();
        stop = null;
      }
    });
    io.observe(wrap);

    wrap.addEventListener("mousemove", onMove, { passive: true });
    wrap.addEventListener("mouseleave", onLeave);
    wrap.addEventListener("click", onClick);

    return () => {
      io.disconnect();
      stop?.();
      wrap.removeEventListener("mousemove", onMove);
      wrap.removeEventListener("mouseleave", onLeave);
      wrap.removeEventListener("click", onClick);
    };
  }, [amplitude, glitch, slices]);

  return (
    <div
      ref={wrapRef}
      role="img"
      aria-label="LORIMER"
      data-cursor="LORIMER®"
      className={cn("flex w-full select-none", inverted && "invert", className)}
      style={{ aspectRatio: LOGO_RATIO }}
    >
      {indices.map((i) => (
        <div
          key={i}
          className="h-full flex-1 bg-no-repeat will-change-transform"
          style={{
            backgroundImage: `url('${LOGO_SRC}')`,
            backgroundSize: `${slices * 100}% 100%`,
            backgroundPosition: `${(i / (slices - 1)) * 100}% 0`
          }}
        />
      ))}
    </div>
  );
}

/** Plain static wordmark for places that don't need the engine (nav, small). */
export function LogoMark({
  inverted = false,
  className
}: {
  inverted?: boolean;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={LOGO_SRC}
      alt="LORIMER"
      className={cn("h-auto w-full select-none", inverted && "invert", className)}
      style={{ aspectRatio: LOGO_RATIO }}
    />
  );
}
