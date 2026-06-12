import { DarkChapter } from "@/components/dark-chapter";
import { FolioTeaser } from "@/components/folio-teaser";
import { LogoSlices } from "@/components/logo-slices";
import { LookIndex } from "@/components/look-index";
import { Preloader } from "@/components/preloader";
import { Reveal } from "@/components/reveal";
import { Ticker } from "@/components/ticker";
import { getFolioGarments } from "@/lib/folio";
import { getStorefrontData } from "@/lib/storefront";

export default async function HomePage() {
  const data = await getStorefrontData();
  const garments = await getFolioGarments();
  const bySlug = new Map(garments.map((g) => [g.slug, g]));

  const lookItems = data.looks.map((look, i) => {
    const lead = look.productSlugs.map((slug) => bySlug.get(slug)).find(Boolean);
    return {
      href: "/ss24#plate-" + (i + 1),
      no: `LOOK_${String(i + 1).padStart(2, "0")}`,
      name: look.title.split(" with ")[0],
      meta: lead?.material.toUpperCase() ?? "S/S24",
      status: lead?.statusLabel.toUpperCase() ?? "RECORDED",
      image: look.images[0]
    };
  });

  const folioLook = data.looks[3] ?? data.looks[0];

  return (
    <>
      <Preloader frames={data.looks.map((look) => look.images[0])} />

      <main id="top">
        {/* ——— hero ——— */}
        <header className="relative flex min-h-svh flex-col justify-end px-5 pb-8 md:px-7 xl:px-10">
          <div className="absolute inset-x-5 top-[24vh] flex flex-col gap-6 md:inset-x-7 md:flex-row md:items-start md:justify-between xl:inset-x-10">
            <p className="meta-label text-fog">
              EST. BROOKLYN — GARDEN SHOW {`09.05`}
            </p>
            <p className="serif-voice max-w-[30ch] text-[clamp(1.25rem,2.4vw,2.1rem)] leading-snug">
              Garments kept as records. Six looks, one chapter, no noise.
            </p>
          </div>

          <LogoSlices className="mt-auto" />

          <div className="mt-6 flex items-end justify-between gap-4 border-t border-ink pt-3">
            <span className="meta-label text-fog">REGISTERED TRADEMARK — ®</span>
            <span className="meta-label hidden text-fog md:block">
              SCROLL TO ENTER THE RECORD ↓
            </span>
            <span className="meta-label text-fog">S/S24 — CHAPTER 01</span>
          </div>
        </header>

        <Ticker
          items={[
            "LORIMER S/S24",
            "GARDEN SHOW",
            "SIX LOOKS",
            "DECONSTRUCTED TAILORING",
            "WAX COATED DENIM",
            "UNIVERSITY OF LORIMER"
          ]}
          accents={["GARDEN SHOW"]}
        />

        {/* ——— manifesto ——— */}
        <section className="page-shell py-[18vh]">
          <Reveal
            effect="words"
            as="p"
            className="max-w-5xl font-serif text-[clamp(1.9rem,4.6vw,3.9rem)] font-normal leading-[1.22]"
          >
            Lorimer does not present collections. It keeps records — of a garment, a
            garden, an afternoon where the hem of something white touched a black
            runway and stayed.
          </Reveal>
          <Reveal effect="fade" className="mt-9 flex gap-8">
            <span className="meta-label text-fog">CHAPTER 01 — S/S24</span>
            <span className="meta-label text-fog">RECORDED 09.05.2024</span>
          </Reveal>
        </section>

        {/* ——— look index ——— */}
        <section className="page-shell pb-[14vh]">
          <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between">
            <Reveal effect="clip" as="h2" className="editorial-mega text-[clamp(3rem,8vw,7rem)]">
              The Index
            </Reveal>
            <span className="meta-label text-fog">
              SIX LOOKS — FULL SEQUENCE IN THE FOLIO
            </span>
          </div>
          <LookIndex items={lookItems} />
        </section>

        {/* ——— dark chapter ——— */}
        <DarkChapter image={data.home.heroImages[0]} className="min-h-[120svh]">
          <div className="flex min-h-[120svh] flex-col items-center justify-center gap-8 px-5 py-[16vh] text-center">
            <Reveal effect="fade" as="span" className="meta-label text-paper/50">
              AFTER HOURS — THE CONCRETE STUDIES
            </Reveal>
            <Reveal
              effect="fade"
              as="p"
              className="serif-voice max-w-[24ch] text-[clamp(1.6rem,3.6vw,3.2rem)] leading-[1.3]"
            >
              When the show ends, the garments go back to the ruin they were cut for.
            </Reveal>
            <Reveal effect="fade" className="h-16 w-px bg-gradient-to-b from-paper to-transparent" />
            <Reveal effect="fade" className="w-[min(420px,70vw)]">
              <LogoSlices inverted slices={14} amplitude={18} />
            </Reveal>
          </div>
        </DarkChapter>

        {/* ——— folio teaser ——— */}
        <section className="page-shell grid items-center gap-12 py-[16vh] md:grid-cols-2">
          <div>
            <Reveal effect="fade" as="span" className="meta-label block text-fog">
              02 — THE LOOKBOOK
            </Reveal>
            <Reveal effect="clip" as="h2" className="editorial-mega mt-3 text-[clamp(2.8rem,5.6vw,5.2rem)]">
              An actual
              <br />
              book.
            </Reveal>
            <Reveal
              effect="fade"
              as="p"
              className="serif-voice mt-6 max-w-[42ch] text-[1.2rem] leading-relaxed text-ink/80"
            >
              S/S24 is bound as a folio — cover, index, six plates, a closing frame.
              Pages lift and turn under the cursor; on touch they follow your thumb.
            </Reveal>
          </div>
          <Reveal effect="fade">
            <FolioTeaser
              plateImage={folioLook.images[0]}
              plateLabel="LOOK 04 — ASYMMETRICAL WHITE"
            />
          </Reveal>
        </section>
      </main>
    </>
  );
}
