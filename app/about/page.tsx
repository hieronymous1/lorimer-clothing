import { InquiryForm } from "@/components/inquiry-form";
import { RouteState } from "@/components/route-state";
import { SectionHeading } from "@/components/section-heading";
import { SiteImage } from "@/components/site-image";
import { SiteNav } from "@/components/site-nav";
import { getSiteChromeData, getStorefrontData } from "@/lib/storefront";

export default async function AboutPage() {
  const chrome = await getSiteChromeData();
  const data = await getStorefrontData();

  return (
    <>
      <SiteNav pathname="/about" logoSrc={chrome.logoSrc} />
      <main className="page-shell pb-24">
        <section className="page-section space-y-6">
          <SectionHeading
            eyebrow="Studio note"
            title="Lorimer treats garments as constructed documents before they are treated as products."
            description="The application keeps that tone in the structure: generous whitespace, minimal language, and route relationships that move between collection context and individual object study."
          />
        </section>

        <section className="page-section grid gap-8 xl:grid-cols-2 xl:gap-16">
          <div className="space-y-6">
            <SiteImage
              src={chrome.logoSrc}
              alt="Lorimer logo"
              className="aspect-[3.2/1] max-w-[240px] bg-transparent"
              priority
            />
            <p className="editorial-copy">
              The storefront baseline preserves the image-led language from the rebuilt static
              experience while opening clean seams for Shopify catalog data and Sanity-driven
              editorial composition.
            </p>
          </div>
          <div className="space-y-6 bg-panel/50 p-8">
            <p className="text-[0.74rem] uppercase tracking-[0.18em] text-fog">Material register</p>
            <h2 className="text-balance text-[2rem] leading-[0.95] md:text-[3rem]">
              Texture, cut, and sequence stay ahead of commercial chrome.
            </h2>
            <p className="editorial-copy">
              Text only clarifies what proportion, crop, and adjacency cannot already state through
              the imagery.
            </p>
          </div>
        </section>

        <section className="page-section space-y-10">
          <SectionHeading
            eyebrow="Three principles"
            title="The same editorial rules carry across home, products, and collection pages."
          />
          {data.aboutPrinciples.length ? (
            <div className="grid gap-8 md:grid-cols-3">
              {data.aboutPrinciples.map((principle) => (
                <article key={principle.index} className="space-y-3 border-t border-line pt-5">
                  <p className="text-[0.74rem] uppercase tracking-[0.18em] text-fog">
                    {principle.index}
                  </p>
                  <h3 className="text-[1.4rem] leading-tight text-ink">{principle.title}</h3>
                  <p className="text-base leading-7 text-fog">{principle.copy}</p>
                </article>
              ))}
            </div>
          ) : (
            <RouteState
              eyebrow="Studio notes pending"
              title="The principle register is between revisions."
              description="This route remains open for direct contact while the longer editorial notes are rewritten."
              inset
            />
          )}
        </section>

        <section className="page-section space-y-10">
          <SectionHeading
            eyebrow="Direct contact"
            title="Appointments, archive questions, and product requests can be sent directly through the site."
          />
          <InquiryForm defaultSubject="Lorimer studio inquiry" />
        </section>
      </main>
    </>
  );
}
