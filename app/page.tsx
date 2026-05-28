import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { RouteState } from "@/components/route-state";
import { SectionHeading } from "@/components/section-heading";
import { SiteImage } from "@/components/site-image";
import { SiteNav } from "@/components/site-nav";
import { getFeaturedProducts, getSiteChromeData, getStorefrontData } from "@/lib/storefront";

export default async function HomePage() {
  const chrome = await getSiteChromeData();
  const data = await getStorefrontData();
  const featured = await getFeaturedProducts();

  return (
    <>
      <SiteNav pathname="/" logoSrc={chrome.logoSrc} />
      <main className="page-shell pb-24">
        <section className="page-section grid gap-10 xl:grid-cols-hero xl:gap-16 xl:pt-16">
          <div className="flex flex-col justify-between gap-8 xl:min-h-[78vh] xl:pt-10">
            <div className="space-y-5">
              <p className="text-[0.76rem] uppercase tracking-[0.18em] text-fog">
                Runway archive / Madrid
              </p>
              <h1 className="editorial-title">
                Lorimer stages clothing as an archive first and commerce second.
              </h1>
              <p className="editorial-copy">
                The new storefront keeps the PDF-led composition, but it now sits inside a proper
                application shell with catalog, CMS, and commerce boundaries prepared for launch.
              </p>
            </div>
            <div className="flex flex-wrap gap-6 text-[0.82rem] uppercase tracking-[0.18em]">
              <Link href="/shop" className="border-b border-ink pb-1 transition hover:opacity-70">
                Open products
              </Link>
              <Link href="/ss24" className="border-b border-ink/40 pb-1 text-fog transition hover:text-ink">
                View S/S24
              </Link>
            </div>
          </div>
          {data.home.heroImages.length ? (
            <div className="grid gap-4 md:grid-cols-12">
              {data.home.heroImages.map((image, index) => (
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
            </div>
          ) : (
            <RouteState
              eyebrow="Visual sequence pending"
              title="The runway plates for this chapter have not been staged yet."
              description="The storefront shell is live, but the opening image sequence is still being assembled from the archive."
              actions={[{ href: "/shop", label: "Open products" }]}
              inset
            />
          )}
        </section>

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

        <section className="page-section space-y-10">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <SectionHeading
              eyebrow="Selected products"
              title="Product pages behave like plates from a collection archive."
            />
            <Link href="/shop" className="text-[0.78rem] uppercase tracking-[0.18em] text-fog transition hover:text-ink">
              See all products
            </Link>
          </div>
          {featured.length ? (
            <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-3">
              {featured.map((product) => (
                <ProductCard key={product.slug} product={product} />
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
      </main>
    </>
  );
}
