import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { InquiryForm } from "@/components/inquiry-form";
import { ProductCard } from "@/components/product-card";
import { ProductCta } from "@/components/product-cta";
import { Reveal } from "@/components/reveal";
import { SiteImage } from "@/components/site-image";
import { getFolioGarments } from "@/lib/folio";
import { getAllProducts, getProductBySlug, getRelatedProducts } from "@/lib/storefront";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return (await getAllProducts()).map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  return {
    title: product.title,
    description: product.description
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const garments = await getFolioGarments();
  const recordIndex = garments.findIndex((garment) => garment.slug === slug);
  const record = recordIndex >= 0 ? garments[recordIndex] : null;

  if (!record) {
    notFound();
  }

  const related = await getRelatedProducts(record);
  const prev = garments[(recordIndex - 1 + garments.length) % garments.length];
  const next = garments[(recordIndex + 1) % garments.length];
  const primaryImage = record.gallery[0];
  const detailImages = record.gallery.slice(1);
  const sizes = record.sizes.length ? record.sizes.join(" / ") : "Shared on request";

  return (
    <main className="page-shell pb-28 pt-28 md:pt-32">
      {/* record header strip */}
      <div className="flex items-baseline justify-between border-b border-ink pb-3">
        <span className="meta-label text-fog">
          RECORD {String(recordIndex + 1).padStart(2, "0")} /{" "}
          {String(garments.length).padStart(2, "0")}
        </span>
        <span className="meta-label text-fog">{record.season.toUpperCase()}</span>
        <Link href="/shop" data-cursor="BACK" className="lnk-sweep meta-label">
          The Archive
        </Link>
      </div>

      {/* the spread: image left, data right — the folio's data page, unbound */}
      <section className="grid gap-12 py-12 xl:grid-cols-[minmax(0,7fr)_minmax(340px,4fr)] xl:gap-16">
        <div className="space-y-4">
          <Reveal effect="clip">
            <SiteImage
              src={primaryImage?.src ?? record.cover}
              alt={primaryImage?.alt ?? record.coverAlt}
              className="aspect-[0.74]"
              priority
              sizes="(min-width: 1280px) 58vw, 100vw"
            />
          </Reveal>
          {detailImages.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {detailImages.map((image, index) => (
                <Reveal effect="fade" key={image.src}>
                  <figure>
                    <SiteImage
                      src={image.src}
                      alt={image.alt}
                      className="aspect-[0.78]"
                      sizes="(min-width: 1280px) 28vw, 100vw"
                    />
                    <figcaption className="meta-label mt-2 text-fog">
                      DETAIL {String(index + 1).padStart(2, "0")}
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          ) : null}
        </div>

        <aside className="xl:sticky xl:top-28 xl:self-start">
          <div className="space-y-6">
            <Reveal effect="clip" as="h1" className="editorial-mega text-balance text-[clamp(2.6rem,5vw,4.6rem)]">
              {record.title}
            </Reveal>

            <Reveal effect="fade" className="flex items-baseline gap-4">
              <span className="font-mono text-[1rem] tracking-[0.06em]">{record.priceLabel}</span>
              <span className="state-chip state-chip-hot">{record.statusLabel}</span>
            </Reveal>

            <Reveal effect="fade" as="p" className="serif-voice text-[1.15rem] leading-relaxed text-ink/80">
              {record.description}
            </Reveal>

            <Reveal effect="fade">
              <dl className="border-y border-line">
                {(
                  [
                    ["MATERIAL", record.material],
                    ["SIZING", sizes],
                    ["LOOK", record.lookNumber ? `LOOK ${String(record.lookNumber).padStart(2, "0")} — S/S24` : "S/S24"],
                    ["BUILD", record.details]
                  ] as const
                ).map(([label, value]) => (
                  <div
                    key={label}
                    className="grid grid-cols-[100px_minmax(0,1fr)] gap-3 border-b border-line py-3 last:border-b-0"
                  >
                    <dt className="meta-label text-fog">{label}</dt>
                    <dd className="font-mono text-[0.72rem] uppercase leading-5 tracking-[0.06em]">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            <Reveal effect="fade" className="flex flex-wrap items-center gap-6">
              <ProductCta product={record} />
              {record.lookNumber ? (
                <Link
                  href={`/ss24#plate-${record.lookNumber}`}
                  data-cursor="OPEN"
                  className="lnk-sweep meta-label"
                >
                  See plate {String(record.lookNumber).padStart(2, "0")} in the folio
                </Link>
              ) : null}
            </Reveal>
          </div>
        </aside>
      </section>

      {/* worn context */}
      {record.styleGallery.length ? (
        <section className="border-t border-line py-14">
          <Reveal effect="fade" as="p" className="meta-label mb-8 text-fog">
            WORN CONTEXT — THE GARDEN SHOW
          </Reveal>
          <div className="grid gap-4 xl:grid-cols-12">
            {record.styleGallery.map((image, index) => (
              <Reveal
                effect="fade"
                key={image.src}
                className={
                  index === 0
                    ? "xl:col-span-5"
                    : index === 1
                      ? "xl:col-span-4 xl:mt-14"
                      : "xl:col-span-3 xl:mt-28"
                }
              >
                <SiteImage
                  src={image.src}
                  alt={image.alt}
                  className="aspect-[0.78]"
                  sizes="(min-width: 1280px) 30vw, 100vw"
                />
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}

      {/* inquiry */}
      <section className="border-t border-line py-14">
        <Reveal effect="fade" as="p" className="meta-label mb-3 text-fog">
          DIRECT INQUIRY
        </Reveal>
        <Reveal
          effect="fade"
          as="h2"
          className="serif-voice mb-8 max-w-3xl text-[clamp(1.4rem,2.6vw,2.2rem)] leading-snug"
        >
          Questions and sizing requests go directly to the studio.
        </Reveal>
        <InquiryForm
          defaultSubject={`Lorimer inquiry: ${record.title}`}
          productSlug={record.slug}
          productTitle={record.title}
        />
      </section>

      {/* adjacent records */}
      {related.length ? (
        <section className="border-t border-line py-14">
          <Reveal effect="fade" as="p" className="meta-label mb-8 text-fog">
            ADJACENT RECORDS
          </Reveal>
          <div className="grid gap-x-7 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
            {related.map((relatedProduct, index) => (
              <ProductCard key={relatedProduct.slug} product={relatedProduct} index={index} />
            ))}
          </div>
        </section>
      ) : null}

      {/* prev / next */}
      <nav className="grid grid-cols-2 border-t border-ink pt-5" aria-label="Adjacent garments">
        <Link href={`/product/${prev.slug}`} data-cursor="PREV" className="group">
          <span className="meta-label text-fog">← PREVIOUS RECORD</span>
          <p className="editorial-wide mt-1.5 max-w-[26ch] text-[1rem] leading-tight group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
            {prev.title}
          </p>
        </Link>
        <Link href={`/product/${next.slug}`} data-cursor="NEXT" className="group text-right">
          <span className="meta-label text-fog">NEXT RECORD →</span>
          <p className="editorial-wide ml-auto mt-1.5 max-w-[26ch] text-[1rem] leading-tight group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
            {next.title}
          </p>
        </Link>
      </nav>
    </main>
  );
}
