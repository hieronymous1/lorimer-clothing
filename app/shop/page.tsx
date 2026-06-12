import type { Metadata } from "next";

import { ArchiveGrid } from "@/components/archive-grid";
import { Reveal } from "@/components/reveal";
import { getFolioGarments } from "@/lib/folio";

export const metadata: Metadata = {
  title: "The Archive",
  description:
    "Every LORIMER garment as a record — look, material, state, and price visible up front. Archive pieces, inquiry pieces, and checkout pieces share one tone."
};

export default async function ShopPage() {
  const records = await getFolioGarments();

  return (
    <main className="page-shell min-h-svh pb-28 pt-28 md:pt-32">
      <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <Reveal effect="clip" as="h1" className="editorial-mega text-[clamp(3.4rem,10vw,9rem)]">
          The Archive
        </Reveal>
        <Reveal effect="fade" as="p" className="meta-label pb-3 text-fog">
          {String(records.length).padStart(2, "0")} GARMENT RECORDS — S/S24
        </Reveal>
      </div>

      <ArchiveGrid records={records} />
    </main>
  );
}
