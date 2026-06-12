import Link from "next/link";
import { notFound } from "next/navigation";

import { FadeInSection } from "@/components/fade-in-section";
import { RouteState } from "@/components/route-state";
import { SectionHeading } from "@/components/section-heading";
import { SiteImage } from "@/components/site-image";
import { SiteNav } from "@/components/site-nav";
import { getCollectionBySlug, getSiteChromeData, getStorefrontData } from "@/lib/storefront";

export default async function SS24Page() {
  const chrome = await getSiteChromeData();
  const collection = await getCollectionBySlug("ss24");
  const data = await getStorefrontData();

  if (!collection) {
    notFound();
  }

  return (
    <>
      <SiteNav pathname="/ss24" logoSrc={chrome.logoSrc} />
      <main className="page-shell pb-32 xl:pb-48">
        <FadeInSection>
          <section className="page-section space-y-6">
            <SectionHeading
              eyebrow={collection.eyebrow}
              title={collection.title}
              description={collection.intro}
            />
          </section>
        </FadeInSection>

        <section className="page-section grid gap-10 xl:grid-cols-shop xl:gap-14">
          <aside className="space-y-5 xl:sticky xl:top-32 xl:self-start">
            <p className="meta-label">Look index</p>
            {collection.looks.length ? (
              <nav className="flex flex-col gap-3 text-sm uppercase tracking-[0.12em] text-fog">
                {collection.looks.map((look) => (
                  <a
                    key={look.id}
                    href={`#${look.id}`}
                    className="flex justify-between gap-4 border-t border-line pt-3 transition hover:text-ink"
                  >
                    <span>{look.label}</span>
                    <span>{String(look.images.length).padStart(2, "0")}</span>
                  </a>
                ))}
              </nav>
            ) : (
              <p className="max-w-xs text-sm leading-7 text-fog">
                The look index will return once the season sequence is republished.
              </p>
            )}
          </aside>
          <div className="space-y-16">
            {collection.looks.length ? (
              collection.looks.map((look) => {
                const linkedProducts = look.productSlugs
                  .map((slug) => data.products.find((product) => product.slug === slug))
                  .filter(Boolean);

                return (
                  <FadeInSection key={look.id}>
                    <section id={look.id} className="space-y-8">
                      <div className="grid gap-4 border-b border-line pb-6 xl:grid-cols-[160px_minmax(0,1fr)]">
                        <p className="meta-label">{look.label}</p>
                        <div className="space-y-3">
                          <h2 className="max-w-5xl text-[2.8rem] uppercase leading-[0.82] text-ink md:text-[5.5rem]">
                            {look.title}
                          </h2>
                          <p className="max-w-2xl text-base leading-7 text-fog">{look.caption}</p>
                        </div>
                      </div>
                      {look.images.length ? (
                        <div className="grid gap-3 xl:grid-cols-12">
                          {look.images.map((image, imageIndex) => (
                            <figure
                              key={image.src}
                              className={
                                imageIndex === 0
                                  ? "xl:col-span-7"
                                  : imageIndex === 1
                                    ? "xl:col-span-5 xl:mt-20"
                                    : "xl:col-span-6 xl:col-start-4"
                              }
                            >
                              <SiteImage
                                src={image.src}
                                alt={image.alt}
                                className={
                                  imageIndex === 0
                                    ? "aspect-[0.78]"
                                    : imageIndex === 1
                                      ? "aspect-[1.08]"
                                      : "aspect-[1.35]"
                                }
                                sizes="(min-width: 1280px) 45vw, 100vw"
                              />
                              <figcaption className="mt-2 meta-label">
                                {look.label} / Plate {String(imageIndex + 1).padStart(2, "0")}
                              </figcaption>
                            </figure>
                          ))}
                        </div>
                      ) : (
                        <RouteState
                          eyebrow={look.label}
                          title={`${look.title} is awaiting its image sequence.`}
                          description="The look remains indexed in the season narrative even though its plates have not been restored yet."
                          inset
                        />
                      )}
                      {linkedProducts.length ? (
                        <div className="flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-5 text-[0.78rem] uppercase tracking-[0.18em] text-fog">
                          {linkedProducts.map((product) => (
                            <Link
                              key={product!.slug}
                              href={`/product/${product!.slug}`}
                              className="transition hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
                            >
                              {product!.title}
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[0.78rem] uppercase tracking-[0.18em] text-fog">
                          Product links are being attached to this look.
                        </p>
                      )}
                    </section>
                  </FadeInSection>
                );
              })
            ) : (
              <RouteState
                eyebrow="Season pending"
                title="The S/S24 sequence is temporarily off-stage."
                description="The route remains published, but the season looks are being reset before the next release."
                actions={[{ href: "/shop", label: "Open products" }]}
              />
            )}
          </div>
        </section>
      </main>
    </>
  );
}
