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
          <section className="page-section flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
            <SectionHeading
              eyebrow="Current chapter"
              title="Quiet structure, reduced language, and image-led navigation."
            />
            <p className="editorial-copy xl:max-w-xl">
              The landing page opens with the final imagery, then moves into product and lookbook
              surfaces without collapsing into a generic centered commerce grid.
            </p>
          </section>
        </FadeInSection>

        <FadeInSection>
          <section className="page-section space-y-10">
            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <SectionHeading
                eyebrow="Selected products"
                title="Product pages behave like plates from a collection archive."
              />
              <Link href="/shop" className="text-[0.72rem] tracking-[0.12em] text-fog transition hover:text-ink">
                SEE ALL PRODUCTS
              </Link>
            </div>
            {featured.length ? (
              <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-3">
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
              eyebrow="Horizontal studies"
              title="Editorial frames stretch the pacing between object study and collection context."
            />
            {data.home.filmstrip.length ? (
              <div className="grid gap-5 xl:grid-cols-3">
                {data.home.filmstrip.map((image, index) => (
                  <SiteImage
                    key={image.src}
                    src={image.src}
                    alt={image.alt}
                    className={index === 2 ? "aspect-[1.35]" : "aspect-[1.55]"}
                    sizes="(min-width: 1280px) 30vw, 100vw"
                  />
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
