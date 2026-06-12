"use client";

import Link from "next/link";

import { SiteImage } from "@/components/site-image";
import type { StorefrontProduct } from "@/lib/types";

/**
 * A garment as an archive record: indexed, labelled, state visible.
 * Hover swaps to the styled context frame and flips the state chip.
 */
export function ProductCard({
  product,
  index = 0
}: {
  product: StorefrontProduct;
  index?: number;
}) {
  const preview =
    product.gallery.find((image) => image.src !== product.cover) ?? product.styleGallery[0];

  return (
    <article className="group border-t border-ink/80 pt-2.5">
      <Link
        href={`/product/${product.slug}`}
        data-cursor="VIEW"
        className="block space-y-3.5"
      >
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[0.66rem] tracking-meta text-fog">
            REC_{String(index + 1).padStart(2, "0")}
          </span>
          <span className="meta-label text-fog">{product.season.toUpperCase()}</span>
        </div>

        <div className="relative overflow-hidden">
          <SiteImage
            src={product.cover}
            alt={product.coverAlt}
            className="aspect-[0.78]"
            imageClassName="transition-transform duration-700 ease-editorial group-hover:scale-[1.03]"
            sizes="(min-width: 1280px) 28vw, (min-width: 768px) 40vw, 92vw"
          />
          {preview ? (
            <SiteImage
              src={preview.src}
              alt={preview.alt}
              className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              sizes="(min-width: 1280px) 28vw, (min-width: 768px) 40vw, 92vw"
            />
          ) : null}
        </div>

        <div className="flex items-start justify-between gap-3">
          <h3 className="editorial-wide max-w-[24ch] text-[1.05rem] leading-[1.05]">
            {product.title}
          </h3>
          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <span className="meta-label text-fog">{product.priceLabel}</span>
            <span className="state-chip">{product.statusLabel}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}
