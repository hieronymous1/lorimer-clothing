import { FadeInSection } from "@/components/fade-in-section";
import { ProductCard } from "@/components/product-card";
import { RouteState } from "@/components/route-state";
import { SectionHeading } from "@/components/section-heading";
import { SiteNav } from "@/components/site-nav";
import { getSiteChromeData, getStorefrontData } from "@/lib/storefront";

export default async function ShopPage() {
  const chrome = await getSiteChromeData();
  const data = await getStorefrontData();

  return (
    <>
      <SiteNav pathname="/shop" logoSrc={chrome.logoSrc} />
      <main className="page-shell pb-32 xl:pb-48">
        <FadeInSection>
          <section className="page-section space-y-6">
            <SectionHeading
              eyebrow="Shop"
              title="The catalog keeps every garment tied to its look, state, and studio handling."
              description="Browse by chapter. Availability is visible up front so the shop can hold archive pieces, inquiry pieces, and checkout pieces without changing tone."
            />
          </section>
        </FadeInSection>

        <section className="page-section grid gap-10 xl:grid-cols-shop xl:gap-14">
          <aside className="space-y-5 xl:sticky xl:top-32 xl:self-start">
            <p className="meta-label">Product index</p>
            {data.categories.length ? (
              <nav className="flex flex-col gap-3 text-sm uppercase tracking-[0.12em] text-fog">
                {data.categories.map((category) => (
                  <a
                    key={category.id}
                    href={`#${category.id}`}
                    className="flex justify-between gap-4 border-t border-line pt-3 transition hover:text-ink"
                  >
                    <span>{category.title}</span>
                    <span>{String(category.slugs.length).padStart(2, "0")}</span>
                  </a>
                ))}
              </nav>
            ) : (
              <p className="max-w-xs text-sm leading-7 text-fog">
                Collection groups will appear here once the catalog is assigned to editorial chapters.
              </p>
            )}
          </aside>
          <div className="space-y-16">
            {data.categories.length ? (
              data.categories.map((category) => {
                const products = category.slugs
                  .map((slug) => data.products.find((product) => product.slug === slug))
                  .filter(Boolean);

                return (
                  <FadeInSection key={category.id}>
                    <section id={category.id} className="space-y-8">
                      <div className="grid gap-4 border-b border-line pb-6 xl:grid-cols-[160px_minmax(0,1fr)]">
                        <p className="meta-label">{category.label}</p>
                        <div className="space-y-3">
                          <h2 className="text-[3rem] uppercase leading-[0.82] text-ink md:text-[5rem]">
                            {category.title}
                          </h2>
                          <p className="max-w-2xl text-base leading-7 text-fog">
                            {category.description}
                          </p>
                        </div>
                      </div>
                      {products.length ? (
                        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                          {products.map((product, index) => (
                            <ProductCard key={product!.slug} product={product!} index={index} />
                          ))}
                        </div>
                      ) : (
                        <RouteState
                          eyebrow={category.label}
                          title={`${category.title} is temporarily between edits.`}
                          description="The chapter remains listed, but its products are being reassigned or prepared for release."
                          inset
                        />
                      )}
                    </section>
                  </FadeInSection>
                );
              })
            ) : (
              <RouteState
                eyebrow="Catalog pending"
                title="The shop will reopen once products are grouped back into collection chapters."
                description="No editorial sections are published yet, so the route stays available as a quiet placeholder instead of collapsing into an empty grid."
                actions={[{ href: "/", label: "Return home" }]}
              />
            )}
          </div>
        </section>
      </main>
    </>
  );
}
