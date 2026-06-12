"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

import {
  ColophonFace,
  CoverFace,
  EndpaperFace,
  GroupFace,
  IndexFace,
  InsideBackFace,
  LookDataFace,
  LookImageFace
} from "@/components/folio/faces";
import type { FolioPlate } from "@/lib/folio";
import { FOLIO_META } from "@/lib/folio";

type Leaf = { front: ReactNode; back: ReactNode };

/**
 * Build the duplex leaves so each open spread reads
 * image (left) | data (right) for every look:
 *
 *   f0 cover      | b0 endpaper
 *   f1 index      | b1 look1 image
 *   fN lookN data | bN lookN+1 image …
 *   fLast colophon| bLast inside back cover
 */
function buildLeaves(plates: FolioPlate[]): Leaf[] {
  const looks = plates.filter((p) => p.kind === "look");
  const index = plates.find((p) => p.kind === "index");
  const group = plates.find((p) => p.kind === "group");
  const leaves: Leaf[] = [];

  leaves.push({
    front: <CoverFace />,
    back: <EndpaperFace />
  });

  leaves.push({
    front: index ? <IndexFace plate={index} /> : <EndpaperFace />,
    back: looks[0] ? <LookImageFace plate={looks[0]} /> : <InsideBackFace />
  });

  for (let i = 0; i < looks.length; i++) {
    leaves.push({
      front: <LookDataFace plate={looks[i]} />,
      back:
        i + 1 < looks.length ? (
          <LookImageFace plate={looks[i + 1]} />
        ) : group ? (
          <GroupFace plate={group} />
        ) : (
          <InsideBackFace />
        )
    });
  }

  leaves.push({
    front: <ColophonFace />,
    back: <InsideBackFace />
  });

  return leaves;
}

function spreadLabel(k: number, lookCount: number) {
  if (k === 0) return "COVER";
  if (k === 1) return "ENDPAPER — INDEX";
  if (k >= 2 && k < 2 + lookCount)
    return `PLATE ${String(k - 1).padStart(2, "0")} / ${String(lookCount).padStart(2, "0")}`;
  return "CLOSING FRAME";
}

function hashFor(k: number, lookCount: number) {
  if (k >= 2 && k < 2 + lookCount) return `#plate-${k - 1}`;
  if (k >= 2 + lookCount) return "#closing";
  return " ";
}

function kFromHash(hash: string, maxK: number) {
  const match = hash.match(/#plate-(\d+)/);
  if (match) return Math.min(Number(match[1]) + 1, maxK);
  if (hash === "#closing") return maxK;
  return 0;
}

export function Folio({ plates }: { plates: FolioPlate[] }) {
  const leaves = useMemo(() => buildLeaves(plates), [plates]);
  const lookCount = plates.filter((p) => p.kind === "look").length;
  const maxK = leaves.length;
  const [k, setK] = useState(0);
  const [flat, setFlat] = useState(false);
  const touchStart = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(
      "(prefers-reduced-motion: reduce), (max-width: 767px)"
    );
    const update = () => setFlat(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    setK(kFromHash(window.location.hash, maxK));
  }, [maxK]);

  const turn = useCallback(
    (dir: 1 | -1) => {
      setK((current) => {
        const next = Math.max(0, Math.min(current + dir, maxK));
        history.replaceState(null, "", hashFor(next, lookCount).trim() || window.location.pathname);
        return next;
      });
    },
    [lookCount, maxK]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") turn(1);
      if (e.key === "ArrowLeft") turn(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [turn]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStart.current;
    touchStart.current = null;
    if (Math.abs(dx) > 48) turn(dx < 0 ? 1 : -1);
  };

  return (
    <section
      aria-label="S/S24 lookbook folio"
      className="flex min-h-svh flex-col bg-paper"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* header strip */}
      <div className="flex items-center justify-between px-5 pb-3 pt-20 md:px-7 xl:px-10">
        <span className="meta-label text-fog">
          FOLIO {FOLIO_META.number} — {spreadLabel(k, lookCount)}
        </span>
        <Link href="/" data-cursor="EXIT" className="lnk-sweep meta-label">
          Close the book
        </Link>
      </div>

      {/* stage */}
      <div className="relative flex flex-1 items-center justify-center px-4 pb-16">
        {flat ? (
          <FlatPager leaves={leaves} k={k} />
        ) : (
          <BookStage leaves={leaves} k={k} turn={turn} />
        )}

        {/* edge controls */}
        <button
          type="button"
          aria-label="Previous page"
          data-cursor="BACK"
          disabled={k === 0}
          onClick={() => turn(-1)}
          className="absolute left-0 top-0 h-full w-[18%] opacity-0 disabled:pointer-events-none md:w-[12%]"
        />
        <button
          type="button"
          aria-label="Next page"
          data-cursor="TURN"
          disabled={k === maxK}
          onClick={() => turn(1)}
          className="absolute right-0 top-0 h-full w-[18%] opacity-0 disabled:pointer-events-none md:w-[12%]"
        />
      </div>

      {/* footer strip */}
      <div className="flex items-center justify-between px-5 pb-5 md:px-7 xl:px-10">
        <button
          type="button"
          data-cursor="BACK"
          onClick={() => turn(-1)}
          disabled={k === 0}
          className="lnk-sweep meta-label disabled:pointer-events-none disabled:opacity-30"
        >
          ← Back
        </button>
        <span className="meta-label hidden text-fog md:block">
          CLICK THE PAGE EDGES, USE ARROW KEYS, OR SWIPE
        </span>
        <button
          type="button"
          data-cursor="TURN"
          onClick={() => turn(1)}
          disabled={k === maxK}
          className="lnk-sweep meta-label disabled:pointer-events-none disabled:opacity-30"
        >
          Turn →
        </button>
      </div>
    </section>
  );
}

function BookStage({
  leaves,
  k,
  turn
}: {
  leaves: Leaf[];
  k: number;
  turn: (dir: 1 | -1) => void;
}) {
  return (
    <div
      className="relative"
      style={{
        perspective: "2400px",
        height: "min(72svh, 60vw)",
        aspectRatio: "4 / 3"
      }}
    >
      {/* table shadow */}
      <div className="absolute inset-x-[6%] -bottom-5 h-8 rounded-[50%] bg-ink/15 blur-xl" />

      <div className="absolute inset-0 [transform-style:preserve-3d]">
        {leaves.map((leaf, i) => {
          const flipped = i < k;
          return (
            <div
              key={i}
              onClick={(e) => {
                if ((e.target as Element).closest("a, button")) return;
                turn(flipped ? -1 : 1);
              }}
              data-cursor={flipped ? "BACK" : "TURN"}
              className="absolute left-1/2 top-0 h-full w-1/2 origin-left transition-transform duration-[1050ms] ease-editorial [transform-style:preserve-3d]"
              style={{
                transform: flipped ? "rotateY(-180deg)" : "rotateY(0deg)",
                zIndex: flipped ? i + 1 : leaves.length - i
              }}
            >
              <div className="absolute inset-0 overflow-hidden shadow-[0_18px_50px_rgba(11,11,10,0.22)] [backface-visibility:hidden]">
                {leaf.front}
                {/* gutter shading */}
                <div className="pointer-events-none absolute inset-y-0 left-0 w-[7%] bg-gradient-to-r from-ink/15 to-transparent" />
              </div>
              <div className="absolute inset-0 overflow-hidden shadow-[0_18px_50px_rgba(11,11,10,0.22)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
                {leaf.back}
                <div className="pointer-events-none absolute inset-y-0 right-0 w-[7%] bg-gradient-to-l from-ink/15 to-transparent" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Reduced-motion / small-screen fallback: one page side at a time,
 * no 3D, instant swaps. Same data, same order, same controls.
 */
function FlatPager({ leaves, k }: { leaves: Leaf[]; k: number }) {
  const face =
    k === 0
      ? leaves[0].front
      : k <= leaves.length - 1
        ? leaves[k].front
        : leaves[leaves.length - 1].back;
  const leftFace = k > 0 ? leaves[k - 1].back : null;

  return (
    <div className="flex w-full max-w-[420px] flex-col gap-3">
      {leftFace ? (
        <div className="relative aspect-[3/4] w-full overflow-hidden shadow-[0_10px_30px_rgba(11,11,10,0.18)]">
          {leftFace}
        </div>
      ) : null}
      <div className="relative aspect-[3/4] w-full overflow-hidden shadow-[0_10px_30px_rgba(11,11,10,0.18)]">
        {face}
      </div>
    </div>
  );
}
