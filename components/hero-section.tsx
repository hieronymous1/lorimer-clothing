"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

import { SiteImage } from "@/components/site-image";
import { RouteState } from "@/components/route-state";

type HeroImage = { src: string; alt: string };

const ease = [0.22, 1, 0.36, 1] as const;

export function HeroSection({ heroImages }: { heroImages: HeroImage[] }) {
  const [showScroll, setShowScroll] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 80) setShowScroll(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="relative flex min-h-[calc(100vh-96px)] flex-col justify-between border-b border-line/80 py-10 xl:py-16">
      <div className="grid gap-10 xl:grid-cols-hero xl:gap-16">
        <motion.div
          className="flex flex-col justify-between gap-8 xl:min-h-[70vh]"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease }}
        >
          <div className="space-y-6">
            <motion.p
              className="text-[0.7rem] tracking-[0.12em] text-fog"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.1, ease }}
            >
              RUNWAY ARCHIVE / MADRID
            </motion.p>
            <motion.h1
              className="editorial-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.2, ease }}
            >
              Lorimer stages clothing as an archive first and commerce second.
            </motion.h1>
            <motion.p
              className="editorial-copy"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.4, ease }}
            >
              The storefront keeps the PDF-led composition inside a proper application shell with
              catalog, CMS, and commerce boundaries prepared for launch.
            </motion.p>
          </div>
          <motion.div
            className="flex flex-wrap gap-6 text-[0.72rem] tracking-[0.12em]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6, ease }}
          >
            <Link href="/shop" className="border-b border-ink pb-1 transition hover:opacity-60">
              OPEN PRODUCTS
            </Link>
            <Link href="/ss24" className="border-b border-ink/30 pb-1 text-fog transition hover:text-ink hover:border-ink">
              VIEW S/S24
            </Link>
          </motion.div>
        </motion.div>

        {heroImages.length ? (
          <motion.div
            className="grid gap-4 md:grid-cols-12"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, delay: 0.15, ease }}
          >
            {heroImages.map((image, index) => (
              <SiteImage
                key={image.src}
                src={image.src}
                alt={image.alt}
                className={
                  index === 0
                    ? "aspect-[0.76] md:col-span-5"
                    : index === 1
                      ? "aspect-[0.76] md:col-span-4 md:mt-16"
                      : "aspect-[0.76] md:col-span-3 md:mt-32"
                }
                priority={index === 0}
                sizes="(min-width: 1024px) 48vw, 100vw"
              />
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, delay: 1.2, ease }}
        >
          <span className="text-[0.64rem] tracking-[0.18em] text-fog/60">SCROLL</span>
          <motion.span
            className="block h-[1px] w-6 bg-fog/40"
            animate={{ scaleX: [1, 1.5, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      )}
    </section>
  );
}
