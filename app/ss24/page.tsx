import type { Metadata } from "next";

import { Folio } from "@/components/folio/folio";
import { getFolioPlates } from "@/lib/folio";

export const metadata: Metadata = {
  title: "S/S24 — The Folio",
  description:
    "The S/S24 chapter bound as an interactive folio: cover, index, six plates from the garden show, and a closing frame."
};

export default async function SS24Page() {
  const plates = await getFolioPlates();

  return (
    <main>
      <Folio plates={plates} />
    </main>
  );
}
