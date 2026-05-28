import Link from "next/link";

import { SiteImage } from "@/components/site-image";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "HOME" },
  { href: "/ss24", label: "S/S_24" },
  { href: "/shop", label: "SHOP" },
  { href: "/about", label: "ABOUT" }
];

export function SiteNav({ pathname, logoSrc }: { pathname: string; logoSrc: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-shell/90 backdrop-blur">
      <nav className="mx-auto flex min-h-[88px] w-full max-w-shell flex-col gap-4 px-4 py-5 md:px-8 xl:grid xl:grid-cols-[1fr_1fr_auto_1fr_1fr] xl:items-center xl:px-12">
        <div className="hidden items-center gap-8 xl:flex">
          {links.slice(0, 2).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-[0.78rem] font-medium tracking-[0.18em] text-ink/80 transition hover:text-ink",
                pathname === link.href && "text-ink"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <Link href="/" className="block w-[148px] md:w-[170px] xl:col-start-3 xl:justify-self-center">
          <SiteImage src={logoSrc} alt="Lorimer" className="aspect-[3.2/1] bg-transparent" priority />
        </Link>
        <div className="flex items-center justify-between border-t border-line pt-4 text-[0.78rem] font-medium tracking-[0.18em] xl:col-start-4 xl:justify-end xl:gap-8 xl:border-t-0 xl:pt-0">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-ink/75 transition hover:text-ink xl:hidden",
                pathname === link.href && "text-ink"
              )}
            >
              {link.label}
            </Link>
          ))}
          {links.slice(2).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "hidden text-ink/80 transition hover:text-ink xl:block",
                pathname === link.href && "text-ink"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
