"use client";

type RafCallback = (time: number) => void;

const callbacks = new Set<RafCallback>();
let handle: number | null = null;

function tick(time: number) {
  for (const cb of callbacks) cb(time);
  handle = callbacks.size > 0 ? requestAnimationFrame(tick) : null;
}

/**
 * Subscribe to the single shared rAF loop. All interaction engines
 * (cursor, logo slices, peek, parallax) ride one loop so the main
 * thread schedules exactly one frame callback per paint.
 */
export function addRaf(cb: RafCallback): () => void {
  callbacks.add(cb);
  if (handle === null) handle = requestAnimationFrame(tick);

  return () => {
    callbacks.delete(cb);
    if (callbacks.size === 0 && handle !== null) {
      cancelAnimationFrame(handle);
      handle = null;
    }
  };
}

export function lerp(current: number, target: number, factor: number) {
  return current + (target - current) * factor;
}

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

export function isFinePointer() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(pointer: fine)").matches
  );
}
