import type { Metadata } from "next";

import { DarkChapter } from "@/components/dark-chapter";
import { InquiryForm } from "@/components/inquiry-form";
import { LogoSlices } from "@/components/logo-slices";
import { Reveal } from "@/components/reveal";
import { getStorefrontData } from "@/lib/storefront";

export const metadata: Metadata = {
  title: "About",
  description:
    "Lorimer treats garments as constructed documents before they are treated as products. Studio notes, principles, and direct contact."
};

export default async function AboutPage() {
  const data = await getStorefrontData();

  return (
    <main className="pt-28 md:pt-32">
      {/* quiet manifesto */}
      <section className="page-shell pb-[14vh]">
        <Reveal effect="fade" as="p" className="meta-label mb-8 text-fog">
          STUDIO NOTE — 01
        </Reveal>
        <Reveal
          effect="words"
          as="p"
          className="max-w-5xl font-serif text-[clamp(1.9rem,4.4vw,3.8rem)] leading-[1.25]"
        >
          Lorimer treats garments as constructed documents before they are treated
          as products. Surface, repair, proportion, and context stay visible before
          the object is reduced to a sale unit.
        </Reveal>
        <Reveal effect="fade" className="mt-10 flex flex-wrap gap-x-10 gap-y-2">
          <span className="meta-label text-fog">EST. BROOKLYN</span>
          <span className="meta-label text-fog">BASE — {data.contact.base.toUpperCase()}</span>
          <span className="meta-label text-fog">SHOWN 09.05.2024 — THE GARDEN</span>
        </Reveal>
      </section>

      {/* principles */}
      <section className="page-shell border-t border-line py-[10vh]">
        <Reveal effect="clip" as="h2" className="editorial-mega mb-12 text-[clamp(2.8rem,7vw,6rem)]">
          The Rules
        </Reveal>
        <div className="grid gap-10 md:grid-cols-3">
          {data.aboutPrinciples.map((principle) => (
            <Reveal effect="fade" key={principle.index} as="article" className="border-t border-ink pt-4">
              <p className="font-mono text-[0.7rem] tracking-meta text-fog">{principle.index}</p>
              <h3 className="editorial-wide mt-3 text-[1.3rem] leading-[1]">{principle.title}</h3>
              <p className="serif-voice mt-4 text-[1.05rem] leading-relaxed text-ink/75">
                {principle.copy}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* the concrete studies */}
      <DarkChapter image={data.home.heroImages[1] ?? data.home.heroImages[0]} className="min-h-[90svh]">
        <div className="flex min-h-[90svh] flex-col items-center justify-center gap-7 px-5 py-[14vh] text-center">
          <Reveal effect="fade" as="span" className="meta-label text-paper/50">
            THE CONCRETE STUDIES
          </Reveal>
          <Reveal
            effect="fade"
            as="p"
            className="serif-voice max-w-[26ch] text-[clamp(1.5rem,3.2vw,2.8rem)] leading-[1.3]"
          >
            The clothes are cut for the city that stays up — then recorded in the
            ruins it leaves behind.
          </Reveal>
          <Reveal effect="fade" className="w-[min(360px,64vw)]">
            <LogoSlices inverted slices={14} amplitude={16} />
          </Reveal>
        </div>
      </DarkChapter>

      {/* contact */}
      <section className="page-shell py-[10vh]">
        <Reveal effect="fade" as="p" className="meta-label mb-3 text-fog">
          DIRECT CONTACT
        </Reveal>
        <Reveal
          effect="fade"
          as="h2"
          className="serif-voice mb-10 max-w-3xl text-[clamp(1.4rem,2.6vw,2.2rem)] leading-snug"
        >
          Appointments, archive questions, and garment requests move through one
          studio channel.
        </Reveal>
        <InquiryForm defaultSubject="Lorimer studio inquiry" />
      </section>
    </main>
  );
}
