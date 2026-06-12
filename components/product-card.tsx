"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import { SiteImage } from "@/components/site-image";
import type { StorefrontProduct } from "@/lib/types";

const ease = [0.22, 1, 0.36, 1] as const;

export function ProductCard({ product, index = 0 }: { product: StorefrontProduct; index?: number }) {
  const reduceMotion = useReducedMotion();
  const preview =
    product.gallery.find((image) => image.src !== product.cover) ?? product.styleGallery[0];
  const stateLabel =
    product.state === "available"
      ? "Available"
      : product.state === "inquiry-only"
        ? "Inquiry"
        : "Archive";

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 40 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, delay: index * 0.1, ease }}
      className="group border-t border-line pt-3"
    >
      <Link
        href={`/product/${product.slug}`}
        className="block space-y-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
      >
        <div className="relative overflow-hidden" data-cursor-expand>
          <motion.div
            whileHover={reduceMotion ? undefined : { scale: 1.015 }}
            transition={{ duration: 0.8, ease }}
            className="origin-center bg-panel"
          >
            <SiteImage
              src={product.cover}
              alt={product.coverAlt}
              className="aspect-[0.78]"
              sizes="(min-width: 1280px) 28vw, (min-width: 768px) 40vw, 92vw"
            />
            {preview ? (
              <SiteImage
                src={preview.src}
                alt={preview.alt}
                className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100"
                sizes="(min-width: 1280px) 28vw, (min-width: 768px) 40vw, 92vw"
              />
            ) : null}
          </motion.div>
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-start">
          <div className="space-y-1.5">
            <p className="meta-label">{product.season}</p>
            <h3 className="max-w-[24ch] text-[1.35rem] leading-[1.02] text-ink">
              {product.title}
            </h3>
          </div>
          <div className="flex gap-4 text-right text-[0.68rem] uppercase tracking-[0.16em] text-fog md:flex-col md:gap-1">
            <p>{product.priceLabel}</p>
            <p className="text-ink">{stateLabel}</p>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
