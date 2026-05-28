import Link from "next/link";

import type { ContactInfo } from "@/lib/types";

export function SiteFooter({ contact }: { contact: ContactInfo }) {
  return (
    <footer className="border-t border-line/80">
      <div className="mx-auto flex w-full max-w-shell flex-col gap-10 px-4 py-10 md:px-8 xl:px-12 xl:py-14">
        <p className="max-w-3xl text-balance text-[1.05rem] leading-7 text-fog">
          Lorimer is staged as a runway archive with commerce kept visually secondary and product
          handling routed through inquiry or checkout only when the garment state permits it.
        </p>
        <div className="grid gap-8 text-sm text-fog md:grid-cols-3">
          <div className="space-y-2">
            <div className="text-[0.75rem] tracking-[0.18em] text-ink">STUDIO</div>
            <p>
              <Link href={`mailto:${contact.email}`} className="transition hover:text-ink">
                {contact.email}
              </Link>
              <br />
              <Link href={`tel:${contact.phoneHref}`} className="transition hover:text-ink">
                {contact.phoneLabel}
              </Link>
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-[0.75rem] tracking-[0.18em] text-ink">BASE</div>
            <p>{contact.base}</p>
          </div>
          <div className="space-y-2">
            <div className="text-[0.75rem] tracking-[0.18em] text-ink">STATUS</div>
            <p>Editorial storefront v1 with Shopify and Sanity integration hooks prepared.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
