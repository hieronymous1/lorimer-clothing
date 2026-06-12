import { FadeInSection } from "@/components/fade-in-section";
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
      <main className="page-shell pb-32 xl:pb-48">
        <FadeInSection>
          <section className="page-section space-y-6">
            <SectionHeading
              eyebrow="Studio note"
              title="Lorimer treats garments as constructed documents before they are treated as products."
              description="The site uses the same rule set: direct imagery, sparse metadata, hard spacing, and no decorative commerce layer between the viewer and the garment."
            />
          </section>
        </FadeInSection>

        <FadeInSection>
          <section className="page-section grid gap-8 xl:grid-cols-2 xl:gap-16">
            <div className="space-y-6">
              <SiteImage
                src={chrome.logoSrc}
                alt="Lorimer logo"
                className="aspect-[3.2/1] max-w-[240px] bg-transparent"
                priority
              />
              <p className="editorial-copy">
                Lorimer works with clothing as a record of construction: surface, repair, proportion,
                and context are allowed to stay visible before the object is reduced to a sale unit.
              </p>
            </div>
            <div className="space-y-6 border-t border-line pt-6">
              <p className="meta-label">Material register</p>
              <h2 className="text-balance text-[2.8rem] uppercase leading-[0.84] md:text-[4.5rem]">
                Texture, cut, and sequence stay ahead of commercial chrome.
              </h2>
              <p className="editorial-copy">
                Text only clarifies what proportion, crop, and adjacency cannot already state through
                the imagery.
              </p>
            </div>
          </section>
        </FadeInSection>

        <FadeInSection>
          <section className="page-section space-y-10">
            <SectionHeading
              eyebrow="Three principles"
              title="The same archive rules carry across home, products, and collection pages."
            />
            {data.aboutPrinciples.length ? (
              <div className="grid gap-8 md:grid-cols-3">
                {data.aboutPrinciples.map((principle) => (
                  <article key={principle.index} className="space-y-3 border-t border-line pt-5">
                    <p className="meta-label">
                      {principle.index}
                    </p>
                    <h3 className="text-[1.6rem] uppercase leading-[0.95] text-ink">{principle.title}</h3>
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
        </FadeInSection>

        <FadeInSection>
          <section className="page-section space-y-10">
            <SectionHeading
              eyebrow="Direct contact"
              title="Appointments, archive questions, and product requests can move through one studio form."
            />
            <InquiryForm defaultSubject="Lorimer studio inquiry" />
          </section>
        </FadeInSection>
      </main>
    </>
  );
}
