"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoMark } from "@/components/logo-slices";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/ss24", label: "S/S24" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" }
] as const;

/**
 * Fixed chrome in mix-blend difference: stays legible over paper and
 * coal sections without ever changing color itself.
 */
export function SiteNav() {
  const pathname = usePathname();

  return (
    <header className="fixed inset-x-0 top-0 z-[940] mix-blend-difference">
      <nav
        aria-label="Primary"
        className="flex items-center justify-between px-5 py-4 text-white md:px-7 xl:px-10"
      >
        <Link
          href="/"
          data-cursor="HOME"
          aria-label="Lorimer home"
          className="w-[108px] shrink-0 md:w-[128px]"
        >
          <LogoMark inverted />
        </Link>

        <span className="meta-label hidden text-white/60 md:block">
          A RECORD — NOT A STORE
        </span>

        <div className="flex items-center gap-5 md:gap-8">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              data-cursor="GO"
              aria-current={pathname === link.href ? "page" : undefined}
              className={cn(
                "lnk-sweep meta-label text-white",
                pathname === link.href && "after:!scale-x-100 after:!origin-left"
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
