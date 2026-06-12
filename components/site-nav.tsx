"use client";

import { useEffect, useState } from "react";
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-30 transition-all duration-500",
        scrolled
          ? "border-b border-line/80 bg-shell/90 backdrop-blur"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <nav className="mx-auto flex min-h-[96px] w-full max-w-shell flex-col gap-4 px-4 py-5 md:px-8 xl:grid xl:grid-cols-[1fr_1fr_auto_1fr_1fr] xl:items-center xl:px-12">
        <div className="hidden items-center gap-8 xl:flex">
          {links.slice(0, 2).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-[0.72rem] tracking-[0.12em] text-ink/70 transition hover:text-ink",
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
        <div className="flex items-center justify-between border-t border-line pt-4 text-[0.72rem] tracking-[0.12em] xl:col-start-4 xl:justify-end xl:gap-8 xl:border-t-0 xl:pt-0">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-ink/70 transition hover:text-ink xl:hidden",
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
                "hidden text-ink/70 transition hover:text-ink xl:block",
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
