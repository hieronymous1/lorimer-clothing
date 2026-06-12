"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "HOME" },
  { href: "/ss24", label: "S/S_24" },
  { href: "/shop", label: "SHOP" },
  { href: "/about", label: "ABOUT" }
];

export function SiteNav({ pathname }: { pathname: string; logoSrc: string }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-30 transition-all duration-300",
        scrolled
          ? "border-b border-line bg-shell"
          : "border-b border-line/0 bg-shell/95"
      )}
    >
      <nav
        aria-label="Primary navigation"
        className="mx-auto grid min-h-16 w-full max-w-shell grid-cols-[1fr_auto] items-center gap-4 px-4 py-3 md:px-8 xl:grid-cols-[1fr_auto_1fr] xl:px-12"
      >
        <Link
          href="/"
          aria-label="Lorimer home"
          className="group inline-flex w-fit items-center gap-2 text-[1.25rem] uppercase leading-none text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
        >
          <span className="h-2 w-2 bg-ink transition group-hover:bg-acid" />
          <span>Lorimer</span>
        </Link>

        <div className="hidden justify-self-center text-[0.68rem] uppercase tracking-[0.18em] text-fog xl:block">
          S/S24 / Archive Storefront
        </div>

        <div className="flex items-center justify-end gap-4 overflow-x-auto text-[0.7rem] uppercase tracking-[0.16em] md:gap-7">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 text-fog transition hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid",
                pathname === link.href && "text-ink"
              )}
            >
              <span
                className={cn(
                  "hidden h-1.5 w-1.5 bg-line md:block",
                  pathname === link.href && "bg-acid"
                )}
              />
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
