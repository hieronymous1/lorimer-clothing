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
      <main className="page-shell pb-24">
        <section className="page-section space-y-6">
          <SectionHeading
            eyebrow="Shop"
            title="The catalog is staged as an authored field instead of a neutral product grid."
            description="Products stay grouped by collection logic and maintain their archive, inquiry, or purchase state without changing the visual tone of the route."
          />
        </section>

        <section className="page-section grid gap-10 xl:grid-cols-shop xl:gap-14">
          <aside className="space-y-5 xl:sticky xl:top-32 xl:self-start">
            <p className="text-[0.74rem] uppercase tracking-[0.18em] text-fog">Look index</p>
            {data.categories.length ? (
              <nav className="flex flex-col gap-3 text-sm text-fog">
                {data.categories.map((category) => (
                  <a key={category.id} href={`#${category.id}`} className="transition hover:text-ink">
                    {category.title}
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
                  <section key={category.id} id={category.id} className="space-y-8">
                    <div className="grid gap-4 border-b border-line pb-6 xl:grid-cols-[160px_minmax(0,1fr)]">
                      <p className="text-[0.74rem] uppercase tracking-[0.18em] text-fog">{category.label}</p>
                      <div className="space-y-3">
                        <h2 className="text-[2rem] leading-none text-ink md:text-[2.5rem]">
                          {category.title}
                        </h2>
                        <p className="max-w-3xl text-lg leading-8 text-fog">{category.description}</p>
                      </div>
                    </div>
                    {products.length ? (
                      <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-3">
                        {products.map((product) => (
                          <ProductCard key={product!.slug} product={product!} />
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
