"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import { SiteImage } from "@/components/site-image";
import { RouteState } from "@/components/route-state";

type HeroImage = { src: string; alt: string };

const ease = [0.22, 1, 0.36, 1] as const;

export function HeroSection({ heroImages }: { heroImages: HeroImage[] }) {
  const [showScroll, setShowScroll] = useState(true);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 80) setShowScroll(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="relative flex min-h-[calc(100vh-64px)] flex-col justify-between border-b border-line py-6 md:py-10 xl:py-12">
      <div className="grid gap-8 xl:grid-cols-hero xl:gap-12">
        <motion.div
          className="flex flex-col justify-between gap-8 xl:min-h-[72vh]"
          initial={reduceMotion ? false : { opacity: 0, y: 24 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease }}
        >
          <div className="space-y-5">
            <motion.p
              className="meta-label"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={reduceMotion ? undefined : { opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.1, ease }}
            >
              MADRID / RUNWAY ARCHIVE / 2024
            </motion.p>
            <motion.h1
              className="editorial-title max-w-[9ch]"
              initial={reduceMotion ? false : { opacity: 0, y: 20 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.2, ease }}
            >
              Lorimer
            </motion.h1>
            <motion.p
              className="max-w-lg text-[1rem] leading-7 text-ink md:text-[1.1rem]"
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.4, ease }}
            >
              Constructed garments, runway plates, and product records arranged as a working archive.
            </motion.p>
          </div>
          <motion.div
            className="grid gap-6 border-t border-line pt-6 text-[0.72rem] uppercase tracking-[0.18em] text-fog md:grid-cols-3"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={reduceMotion ? undefined : { opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6, ease }}
          >
            <div>
              <p className="text-ink">Season</p>
              <p>S/S24</p>
            </div>
            <div>
              <p className="text-ink">Mode</p>
              <p>Archive / Studio</p>
            </div>
            <div className="flex flex-col items-start gap-3">
              <Link href="/shop" className="archive-link">
                Open products
              </Link>
              <Link href="/ss24" className="archive-link border-ink/30 text-fog">
                View S/S24
              </Link>
            </div>
          </motion.div>
        </motion.div>

        {heroImages.length ? (
          <motion.div
            className="grid gap-3 md:grid-cols-12 md:items-end"
            initial={reduceMotion ? false : { opacity: 0, scale: 1.02 }}
            animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, delay: 0.15, ease }}
          >
            {heroImages.map((image, index) => (
              <figure
                key={image.src}
                className={
                  index === 0
                    ? "md:col-span-8"
                    : index === 1
                      ? "md:col-span-4"
                      : "md:col-span-7 md:col-start-6"
                }
              >
                <SiteImage
                  src={image.src}
                  alt={image.alt}
                  className={
                    index === 0
                      ? "aspect-[1.12]"
                      : index === 1
                        ? "aspect-[0.76]"
                        : "aspect-[1.55]"
                  }
                  priority={index === 0}
                  sizes="(min-width: 1280px) 42vw, 100vw"
                />
                <figcaption className="mt-2 flex justify-between gap-4 text-[0.62rem] uppercase tracking-[0.16em] text-fog">
                  <span>Plate {String(index + 1).padStart(2, "0")}</span>
                  <span>{index === 0 ? "Runway" : index === 1 ? "Detail" : "Sequence"}</span>
                </figcaption>
              </figure>
            ))}
          </motion.div>
        ) : (
          <RouteState
            eyebrow="Visual sequence pending"
            title="The runway plates for this chapter have not been staged yet."
            description="The storefront shell is live, but the opening image sequence is still being assembled from the archive."
            actions={[{ href: "/shop", label: "Open products" }]}
            inset
          />
        )}
      </div>

      {showScroll && (
        <motion.div
          className="mt-10 flex items-center gap-3 self-start xl:mt-0"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={reduceMotion ? undefined : { opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, delay: 1.2, ease }}
        >
          <span className="text-[0.64rem] tracking-[0.18em] text-fog/60">SCROLL</span>
          <motion.span
            className="block h-[1px] w-6 bg-fog/40"
            animate={reduceMotion ? undefined : { scaleX: [1, 1.5, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      )}
    </section>
  );
}
