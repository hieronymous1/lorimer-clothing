import Image from "next/image";
import Link from "next/link";

import { LogoMark } from "@/components/logo-slices";
import { FOLIO_META } from "@/lib/folio-shared";
import type { FolioPlate } from "@/lib/folio-shared";

/**
 * Face renderers for the folio leaves. Every face is a full-bleed
 * absolutely-positioned page side; the leaf engine handles the 3D.
 */

export function CoverFace() {
  return (
    <div className="flex h-full w-full flex-col justify-between bg-coal p-[6%]">
      <span className="meta-label text-paper/50">FOLIO — {FOLIO_META.number}</span>
      <div className="w-[80%] self-center">
        <LogoMark inverted />
      </div>
      <div className="meta-label flex justify-between text-paper/50">
        <span>{FOLIO_META.chapter}</span>
        <span>THE PLATES</span>
      </div>
    </div>
  );
}

export function EndpaperFace() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 bg-paper p-[8%]">
      <span className="meta-label text-fog">A RECORD — NOT A STORE</span>
      <p className="serif-voice text-center text-[clamp(0.95rem,1.4vw,1.3rem)] leading-relaxed text-ink/70">
        Six looks walked through a garden.
        <br />
        This folio keeps them.
      </p>
      <span className="meta-label text-fog">RECORDED {FOLIO_META.recorded}</span>
    </div>
  );
}

export function IndexFace({ plate }: { plate: Extract<FolioPlate, { kind: "index" }> }) {
  return (
    <div className="flex h-full w-full flex-col gap-4 overflow-hidden bg-paper p-[7%]">
      <div className="flex items-baseline justify-between border-b border-ink pb-2">
        <h2 className="editorial-wide text-[clamp(1rem,1.6vw,1.5rem)]">Index</h2>
        <span className="meta-label text-fog">{FOLIO_META.chapter}</span>
      </div>
      <div className="grid min-h-0 flex-1 content-start gap-3 overflow-hidden">
        {plate.groups.map((group) => (
          <div key={group.category}>
            <div className="meta-label mb-1.5 text-fog">{group.category}</div>
            {group.garments.map((garment) => (
              <div
                key={garment.slug}
                className="flex items-baseline justify-between gap-2 py-[2px]"
              >
                <span className="truncate font-mono text-[clamp(8px,0.85vw,11px)] uppercase tracking-[0.08em]">
                  {garment.title}
                </span>
                <span className="shrink-0 font-mono text-[clamp(8px,0.85vw,11px)] text-fog">
                  {garment.lookNumber ? `PL.${String(garment.lookNumber).padStart(2, "0")}` : "—"}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <span className="meta-label text-fog">TURN →</span>
    </div>
  );
}

export function LookImageFace({
  plate
}: {
  plate: Extract<FolioPlate, { kind: "look" }>;
}) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-coal-2">
      <Image
        src={plate.image.src}
        alt={plate.image.alt}
        fill
        sizes="(min-width: 768px) 44vw, 92vw"
        className="object-cover"
      />
      <span className="absolute bottom-[4%] left-[5%] bg-paper px-2 py-1 font-mono text-[clamp(8px,0.8vw,10px)] uppercase tracking-meta text-ink">
        PLATE {String(plate.lookNumber).padStart(2, "0")} — {plate.label.toUpperCase()}
      </span>
    </div>
  );
}

export function LookDataFace({
  plate
}: {
  plate: Extract<FolioPlate, { kind: "look" }>;
}) {
  return (
    <div className="flex h-full w-full flex-col bg-paper p-[7%]">
      <div className="flex items-baseline justify-between border-b border-ink pb-2">
        <span className="meta-label">PLATE {String(plate.lookNumber).padStart(2, "0")}</span>
        <span className="meta-label text-fog">{FOLIO_META.chapter}</span>
      </div>

      <h3 className="editorial-wide mt-4 text-[clamp(0.95rem,1.5vw,1.4rem)] leading-tight">
        {plate.title}
      </h3>
      <p className="serif-voice mt-3 text-[clamp(0.8rem,1.05vw,1rem)] leading-relaxed text-ink/70">
        {plate.caption}
      </p>

      <div className="mt-auto space-y-2.5">
        {plate.garments.map((garment) => (
          <Link
            key={garment.slug}
            href={`/product/${garment.slug}`}
            data-cursor="VIEW"
            className="group/g block border-t border-line pt-2"
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="lnk-sweep truncate font-mono text-[clamp(8px,0.85vw,11px)] uppercase tracking-[0.08em]">
                {garment.title}
              </span>
              <span className="shrink-0 font-mono text-[clamp(8px,0.8vw,10px)] uppercase text-fog">
                {garment.priceLabel}
              </span>
            </div>
            <div className="mt-1 flex items-baseline justify-between gap-2">
              <span className="truncate font-mono text-[clamp(7px,0.75vw,9px)] uppercase tracking-[0.08em] text-fog">
                {garment.material}
              </span>
              <span className="state-chip shrink-0 !text-[clamp(7px,0.7vw,9px)]">
                {garment.statusLabel}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function GroupFace({ plate }: { plate: Extract<FolioPlate, { kind: "group" }> }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-coal-2">
      <Image
        src={plate.image.src}
        alt={plate.image.alt}
        fill
        sizes="(min-width: 768px) 44vw, 92vw"
        className="object-cover"
      />
      <span className="absolute bottom-[4%] left-[5%] right-[5%] bg-paper/95 px-2 py-1.5 font-mono text-[clamp(8px,0.8vw,10px)] uppercase tracking-[0.1em] text-ink">
        {plate.caption}
      </span>
    </div>
  );
}

export function ColophonFace() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-5 bg-coal p-[8%] text-center">
      <div className="w-[55%]">
        <LogoMark inverted />
      </div>
      <p className="serif-voice text-[clamp(0.85rem,1.1vw,1.05rem)] leading-relaxed text-paper/70">
        Folio {FOLIO_META.number}. Printed nowhere, bound in code.
        <br />
        Photographed at the garden show, {FOLIO_META.recorded}.
      </p>
      <Link href="/shop" data-cursor="GO" className="lnk-sweep meta-label text-paper">
        Continue to the archive
      </Link>
    </div>
  );
}

export function InsideBackFace() {
  return (
    <div className="flex h-full w-full items-end justify-end bg-coal-2 p-[6%]">
      <span className="meta-label text-paper/30">®</span>
    </div>
  );
}
