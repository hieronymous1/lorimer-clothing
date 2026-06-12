import Link from "next/link";

import type { ContactInfo } from "@/lib/types";

export function SiteFooter({ contact }: { contact: ContactInfo }) {
  return (
    <footer className="border-t border-line bg-ink text-shell">
      <div className="mx-auto flex w-full max-w-shell flex-col gap-10 px-4 py-10 md:px-8 xl:flex-row xl:items-end xl:justify-between xl:px-12 xl:py-14">
        <p className="max-w-xl text-[3.4rem] uppercase leading-[0.78] text-shell md:text-[5rem]">
          Archive first. Store second.
        </p>
        <div className="grid grid-cols-2 gap-8 text-[0.68rem] uppercase tracking-[0.14em] text-shell/60 md:grid-cols-4">
          <div className="space-y-3">
            <div className="text-shell">NAVIGATION</div>
            <nav className="flex flex-col gap-2">
              <Link href="/shop" className="transition hover:text-acid">SHOP</Link>
              <Link href="/ss24" className="transition hover:text-acid">S/S24</Link>
              <Link href="/about" className="transition hover:text-acid">ABOUT</Link>
            </nav>
          </div>
          <div className="space-y-3">
            <div className="text-shell">STUDIO</div>
            <div className="flex flex-col gap-2">
              <Link href={`mailto:${contact.email}`} className="transition hover:text-acid">
                {contact.email}
              </Link>
              <Link href={`tel:${contact.phoneHref}`} className="transition hover:text-acid">
                {contact.phoneLabel}
              </Link>
            </div>
          </div>
          <div className="space-y-3">
            <div className="text-shell">BASE</div>
            <div className="flex flex-col gap-2">
              <span>MONDA ESP</span>
              <span>28012</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="text-shell">INFO</div>
            <div className="flex flex-col gap-2">
              <Link href="/about" className="transition hover:text-acid">CONTACT</Link>
              <span className="text-shell/30">SHIPPING INFO</span>
              <span className="text-shell/30">PRIVACY</span>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-shell/20 px-4 py-4 md:px-8 xl:px-12">
        <p className="text-[0.62rem] uppercase tracking-[0.12em] text-shell/40">
          © {new Date().getFullYear()} LORIMER
        </p>
      </div>
    </footer>
  );
}
