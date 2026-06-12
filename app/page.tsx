import Link from "next/link";

import { HeroSection } from "@/components/hero-section";
import { ProductCard } from "@/components/product-card";
import { RouteState } from "@/components/route-state";
import { SectionHeading } from "@/components/section-heading";
import { SiteImage } from "@/components/site-image";
import { SiteNav } from "@/components/site-nav";
import { FadeInSection } from "@/components/fade-in-section";
import { getFeaturedProducts, getSiteChromeData, getStorefrontData } from "@/lib/storefront";

export default async function HomePage() {
  const chrome = await getSiteChromeData();
  const data = await getStorefrontData();
  const featured = await getFeaturedProducts();

  return (
    <>
      <SiteNav pathname="/" logoSrc={chrome.logoSrc} />
      <main className="page-shell pb-32 xl:pb-48">
        <HeroSection heroImages={data.home.heroImages} />

        <FadeInSection>
          <section className="page-section grid gap-8 xl:grid-cols-[minmax(0,7fr)_minmax(260px,3fr)] xl:items-end">
            <SectionHeading
              eyebrow="Current chapter"
              title="S/S24 is indexed through runway plates, garment records, and sparse studio notes."
            />
            <p className="max-w-sm text-[0.88rem] leading-7 text-fog">
              The site behaves like an archive first: image, status, material, and look number carry
              the experience before checkout language appears.
            </p>
          </section>
        </FadeInSection>

        <FadeInSection>
          <section className="page-section space-y-10">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <SectionHeading
                eyebrow="Selected products"
                title="Garments are presented as records with clear state, price, and chapter."
              />
              <Link href="/shop" className="archive-link">
                See all products
              </Link>
            </div>
            {featured.length ? (
              <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                {featured.map((product, i) => (
                  <ProductCard key={product.slug} product={product} index={i} />
                ))}
              </div>
            ) : (
              <RouteState
                eyebrow="Selection pending"
                title="Featured garments will return once the current chapter is resequenced."
                description="The storefront can still be explored through the full catalog while the selected rail is being reset."
                actions={[{ href: "/shop", label: "See all products" }]}
                inset
              />
            )}
          </section>
        </FadeInSection>

        <FadeInSection>
          <section className="page-section space-y-10">
            <SectionHeading
              eyebrow="Field studies"
              title="Wide frames create the pause between object pages and the full look sequence."
            />
            {data.home.filmstrip.length ? (
              <div className="grid gap-3 xl:grid-cols-12">
                {data.home.filmstrip.map((image, index) => (
                  <figure
                    key={image.src}
                    className={index === 0 ? "xl:col-span-7" : index === 1 ? "xl:col-span-5" : "xl:col-span-8 xl:col-start-5"}
                  >
                    <SiteImage
                      src={image.src}
                      alt={image.alt}
                      className={index === 2 ? "aspect-[1.45]" : "aspect-[1.62]"}
                      sizes="(min-width: 1280px) 55vw, 100vw"
                    />
                    <figcaption className="mt-2 meta-label">Study {String(index + 1).padStart(2, "0")}</figcaption>
                  </figure>
                ))}
              </div>
            ) : (
              <RouteState
                eyebrow="Sequence pending"
                title="The horizontal studies for this release are still off-stage."
                description="This section will repopulate when the supporting image rail is added back into the archive."
                inset
              />
            )}
          </section>
        </FadeInSection>
      </main>
    </>
  );
}
