"use client";

import Image from "next/image";
import Link from "next/link";

import { LogoMark } from "@/components/logo-slices";

type FolioTeaserProps = {
  plateImage: { src: string; alt: string };
  plateLabel: string;
};

/**
 * The closed folio as a 3D object: hover lifts the cover open over the
 * first plate. The full book lives at /ss24 — this is its bookshelf.
 */
export function FolioTeaser({ plateImage, plateLabel }: FolioTeaserProps) {
  return (
    <Link
      href="/ss24"
      data-cursor="OPEN BOOK"
      aria-label="Open the S/S24 folio"
      className="group flex justify-center [perspective:1600px]"
    >
      <div className="folio-teaser-book relative aspect-[2/3] w-[min(280px,68vw)] [transform-style:preserve-3d] [transform:rotateX(8deg)_rotateY(-16deg)] transition-transform duration-[900ms] ease-editorial group-hover:[transform:rotateX(4deg)_rotateY(-4deg)] motion-safe:animate-[folioFloat_5s_ease-in-out_infinite]">
        {/* spine */}
        <span className="absolute -left-[7px] top-0 h-full w-[7px] origin-right bg-coal-2 [transform:rotateY(-40deg)]" />

        {/* first plate underneath */}
        <div className="absolute inset-0 overflow-hidden bg-line shadow-[0_30px_60px_rgba(0,0,0,0.25)]">
          <Image src={plateImage.src} alt={plateImage.alt} fill sizes="280px" className="object-cover" />
          <span className="absolute bottom-2.5 left-2.5 bg-paper px-2 py-1 font-mono text-[9px] uppercase tracking-meta text-ink">
            {plateLabel}
          </span>
        </div>

        {/* cover that lifts open */}
        <div className="absolute inset-0 flex origin-left flex-col justify-between bg-coal p-6 shadow-[0_30px_60px_rgba(0,0,0,0.35)] transition-transform duration-[1100ms] ease-editorial [backface-visibility:hidden] group-hover:[transform:rotateY(-148deg)]">
          <span className="meta-label text-paper/50">FOLIO — N°01</span>
          <div className="w-[78%]">
            <LogoMark inverted />
          </div>
          <div className="meta-label flex justify-between text-paper/50">
            <span>S/S24</span>
            <span>THE PLATES</span>
          </div>
        </div>
      </div>

      <style>{`@keyframes folioFloat { 0%, 100% { translate: 0 0; } 50% { translate: 0 -10px; } }`}</style>
    </Link>
  );
}
