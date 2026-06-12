import Link from "next/link";

import type { ContactInfo } from "@/lib/types";

export function SiteFooter({ contact }: { contact: ContactInfo }) {
  return (
    <footer className="border-t border-line/80">
      <div className="mx-auto flex w-full max-w-shell flex-col gap-10 px-4 py-10 md:px-8 xl:flex-row xl:items-end xl:justify-between xl:px-12 xl:py-14">
        <p className="max-w-sm text-[0.82rem] leading-7 text-fog" style={{ fontFamily: "var(--font-serif)" }}>
          Runway archive. Commerce kept visually secondary.
        </p>
        <div className="grid grid-cols-2 gap-8 text-[0.68rem] tracking-[0.12em] text-fog/70 md:grid-cols-4">
          <div className="space-y-3">
            <div className="text-ink/50">NAVIGATION</div>
            <nav className="flex flex-col gap-2">
              <Link href="/shop" className="transition hover:text-ink">SHOP</Link>
              <Link href="/ss24" className="transition hover:text-ink">S/S24</Link>
              <Link href="/about" className="transition hover:text-ink">ABOUT</Link>
            </nav>
          </div>
          <div className="space-y-3">
            <div className="text-ink/50">STUDIO</div>
            <div className="flex flex-col gap-2">
              <Link href={`mailto:${contact.email}`} className="transition hover:text-ink">
                {contact.email}
              </Link>
              <Link href={`tel:${contact.phoneHref}`} className="transition hover:text-ink">
                {contact.phoneLabel}
              </Link>
            </div>
          </div>
          <div className="space-y-3">
            <div className="text-ink/50">BASE</div>
            <div className="flex flex-col gap-2">
              <span>MONDA ESP</span>
              <span>28012</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="text-ink/50">INFO</div>
            <div className="flex flex-col gap-2">
              <Link href="/about" className="transition hover:text-ink">CONTACT</Link>
              <span className="text-fog/40">SHIPPING INFO</span>
              <span className="text-fog/40">PRIVACY</span>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-line/60 px-4 py-4 md:px-8 xl:px-12">
        <p className="text-[0.62rem] tracking-[0.12em] text-fog/40">
          © {new Date().getFullYear()} LORIMER
        </p>
      </div>
    </footer>
  );
}
