import Link from "next/link";

import { LogoSlices } from "@/components/logo-slices";
import type { ContactInfo } from "@/lib/types";

export function SiteFooter({ contact }: { contact: ContactInfo }) {
  return (
    <footer className="dark-chapter border-t border-ink bg-coal text-paper">
      <div className="page-shell gap-14 py-16 xl:py-24">
        <div className="flex flex-col gap-10 xl:flex-row xl:items-start xl:justify-between">
          <p className="serif-voice max-w-md text-[1.5rem] leading-snug text-paper/80">
            The record continues. F/W25 in preparation.
          </p>

          <div className="grid grid-cols-2 gap-10 md:grid-cols-3">
            <div className="space-y-3">
              <div className="meta-label text-paper/40">Index</div>
              <nav className="flex flex-col gap-2">
                <Link href="/ss24" data-cursor="OPEN" className="lnk-sweep meta-label w-fit text-paper">
                  S/S24 Folio
                </Link>
                <Link href="/shop" data-cursor="GO" className="lnk-sweep meta-label w-fit text-paper">
                  The Archive
                </Link>
                <Link href="/about" data-cursor="GO" className="lnk-sweep meta-label w-fit text-paper">
                  About
                </Link>
              </nav>
            </div>
            <div className="space-y-3">
              <div className="meta-label text-paper/40">Studio</div>
              <div className="flex flex-col gap-2">
                <a href={`mailto:${contact.email}`} data-cursor="WRITE" className="lnk-sweep meta-label w-fit text-paper">
                  {contact.email}
                </a>
                <a href={`tel:${contact.phoneHref}`} data-cursor="CALL" className="lnk-sweep meta-label w-fit text-paper">
                  {contact.phoneLabel}
                </a>
              </div>
            </div>
            <div className="space-y-3">
              <div className="meta-label text-paper/40">Base</div>
              <div className="meta-label flex flex-col gap-2 text-paper/70">
                <span>{contact.base}</span>
                <span>EST. BROOKLYN</span>
              </div>
            </div>
          </div>
        </div>

        <LogoSlices inverted slices={22} amplitude={20} className="mt-4" />

        <div className="flex items-center justify-between border-t border-paper/15 pt-5">
          <p className="meta-label text-paper/40">© {new Date().getFullYear()} LORIMER — REGISTERED TRADEMARK</p>
          <p className="meta-label hidden text-paper/40 md:block">CHAPTER 01 — RECORDED 09.05.2024</p>
        </div>
      </div>
    </footer>
  );
}
