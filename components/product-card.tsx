"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { SiteImage } from "@/components/site-image";
import type { StorefrontProduct } from "@/lib/types";

const ease = [0.22, 1, 0.36, 1] as const;

export function ProductCard({ product, index = 0 }: { product: StorefrontProduct; index?: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.9, delay: index * 0.1, ease }}
      className="group"
    >
      <Link href={`/product/${product.slug}`} className="block space-y-5">
        <div className="relative overflow-hidden" data-cursor-expand>
          <motion.div
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.8, ease }}
            className="origin-center"
          >
            <SiteImage
              src={product.cover}
              alt={product.coverAlt}
              className="aspect-[0.78]"
              sizes="(min-width: 1280px) 28vw, (min-width: 768px) 40vw, 92vw"
            />
          </motion.div>
          {/* Hover overlay */}
          <motion.div
            className="absolute inset-0 flex items-end p-5"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="bg-shell/80 px-3 py-2 backdrop-blur-sm">
              <span className="text-[0.65rem] tracking-[0.16em] text-ink">VIEW PRODUCT</span>
            </div>
          </motion.div>
        </div>
        <div className="space-y-1.5">
          <p className="text-[0.65rem] tracking-[0.12em] text-fog">{product.season}</p>
          <h3 className="max-w-[24ch] text-lg leading-snug tracking-tight text-ink" style={{ fontFamily: "var(--font-serif)" }}>
            {product.title}
          </h3>
          <div className="flex items-center justify-between gap-4 pt-1">
            <p className="text-sm text-fog">{product.priceLabel}</p>
            <p className="text-[0.65rem] tracking-[0.12em] text-fog/70">
              {product.state === "available" ? "AVAILABLE" : product.state === "inquiry-only" ? "INQUIRY" : "ARCHIVE"}
            </p>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
