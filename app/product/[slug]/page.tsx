import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/product-card";
import { ProductCta } from "@/components/product-cta";
import { InquiryForm } from "@/components/inquiry-form";
import { RouteState } from "@/components/route-state";
import { SiteImage } from "@/components/site-image";
import { SiteNav } from "@/components/site-nav";
import { getAllProducts, getProductBySlug, getRelatedProducts, getSiteChromeData } from "@/lib/storefront";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return (await getAllProducts()).map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {};
  }

  return {
    title: product.title,
    description: product.description
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const chrome = await getSiteChromeData();
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const related = await getRelatedProducts(product);
  const primaryImage = product.gallery[0];
  const detailImages = product.gallery.slice(1);
  const productSizes = product.sizes.length ? product.sizes.join(" / ") : "Sizing shared on request";

  return (
    <>
      <SiteNav pathname="/shop" logoSrc={chrome.logoSrc} />
      <main className="page-shell pb-24">
        <section className="page-section grid gap-12 xl:grid-cols-product xl:gap-16">
          <div className="space-y-5">
            <SiteImage
              src={primaryImage?.src ?? product.cover}
              alt={primaryImage?.alt ?? product.coverAlt}
              className="aspect-[0.74]"
              priority
              sizes="(min-width: 1280px) 58vw, 100vw"
            />
            {detailImages.length ? (
              <div className="grid gap-5 md:grid-cols-2">
                {detailImages.map((image) => (
                  <SiteImage
                    key={image.src}
                    src={image.src}
                    alt={image.alt}
                    className="aspect-[0.78]"
                    sizes="(min-width: 1280px) 28vw, 100vw"
                  />
                ))}
              </div>
            ) : (
              <RouteState
                eyebrow="Detail sequence pending"
                title="Secondary product studies have not been staged for this garment yet."
                description="The primary frame remains available while supporting close views are assembled."
                inset
              />
            )}
          </div>

          <aside className="xl:sticky xl:top-32 xl:self-start">
            <div className="space-y-6">
              <p className="text-[0.74rem] uppercase tracking-[0.18em] text-fog">{product.season}</p>
              <h1 className="text-balance text-[2.8rem] leading-[0.9] md:text-[4.5rem]">
                {product.title}
              </h1>
              <div className="space-y-2 text-fog">
                <p className="text-lg">{product.priceLabel}</p>
                <p className="text-[0.74rem] uppercase tracking-[0.18em]">{product.statusLabel}</p>
              </div>
              <p className="editorial-copy">{product.description}</p>

              <dl className="space-y-4 border-y border-line py-6 text-sm text-fog">
                <div className="grid gap-2 md:grid-cols-[110px_minmax(0,1fr)]">
                  <dt className="uppercase tracking-[0.18em] text-ink">State</dt>
                  <dd>{product.statusLabel}</dd>
                </div>
                <div className="grid gap-2 md:grid-cols-[110px_minmax(0,1fr)]">
                  <dt className="uppercase tracking-[0.18em] text-ink">Sizing</dt>
                  <dd>{productSizes}</dd>
                </div>
                <div className="grid gap-2 md:grid-cols-[110px_minmax(0,1fr)]">
                  <dt className="uppercase tracking-[0.18em] text-ink">Construction</dt>
                  <dd>{product.details}</dd>
                </div>
              </dl>

              <div className="flex flex-wrap gap-6 text-[0.82rem] uppercase tracking-[0.18em]">
                <ProductCta product={product} />
                <a href="/shop" className="border-b border-ink/40 pb-1 text-fog transition hover:text-ink">
                  Back to products
                </a>
              </div>
            </div>
          </aside>
        </section>

        <section className="page-section space-y-10">
          <div className="space-y-3">
            <p className="text-[0.74rem] uppercase tracking-[0.18em] text-fog">Direct inquiry</p>
            <h2 className="max-w-4xl text-balance text-[2rem] leading-[0.95] md:text-[3rem]">
              Product questions, archive requests, and sizing conversations stay studio-led.
            </h2>
          </div>
          <InquiryForm
            defaultSubject={`Lorimer inquiry: ${product.title}`}
            productSlug={product.slug}
            productTitle={product.title}
          />
        </section>

        <section className="page-section space-y-10">
          <div className="space-y-3">
            <p className="text-[0.74rem] uppercase tracking-[0.18em] text-fog">Style your garment</p>
            <h2 className="max-w-4xl text-balance text-[2rem] leading-[0.95] md:text-[3rem]">
              Secondary imagery stays atmospheric and keeps the garment inside the wider chapter.
            </h2>
          </div>
          {product.styleGallery.length ? (
            <div className="grid gap-5 xl:grid-cols-3">
              {product.styleGallery.map((image) => (
                <SiteImage
                  key={image.src}
                  src={image.src}
                  alt={image.alt}
                  className="aspect-[0.78]"
                  sizes="(min-width: 1280px) 30vw, 100vw"
                />
              ))}
            </div>
          ) : (
            <RouteState
              eyebrow="Atmosphere pending"
              title="The wider styling sequence is still in edit."
              description="The garment record is live, but the contextual runway imagery for this page has not been restored yet."
              inset
            />
          )}
        </section>

        <section className="page-section space-y-10">
          <div className="space-y-3">
            <p className="text-[0.74rem] uppercase tracking-[0.18em] text-fog">Linked products</p>
            <h2 className="max-w-4xl text-balance text-[2rem] leading-[0.95] md:text-[3rem]">
              Related products reconnect the object to its surrounding chapter.
            </h2>
          </div>
          {related.length ? (
            <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-3">
              {related.map((relatedProduct) => (
                <ProductCard key={relatedProduct.slug} product={relatedProduct} />
              ))}
            </div>
          ) : (
            <RouteState
              eyebrow="Linkage pending"
              title="No adjacent garments are attached to this page yet."
              description="Related pieces will appear once this object is reconnected to its surrounding collection chapter."
              actions={[{ href: "/shop", label: "Browse all products" }]}
              inset
            />
          )}
        </section>
      </main>
    </>
  );
}
