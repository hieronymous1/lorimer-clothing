import type { Metadata } from "next";
import { Archivo, Cormorant_Garamond, IBM_Plex_Mono } from "next/font/google";

import { Grain } from "@/components/grain";
import { ScrollProgress } from "@/components/scroll-progress";
import { SiteCursor } from "@/components/site-cursor";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider";
import { getSiteUrl } from "@/lib/site";
import { getSiteChromeData } from "@/lib/storefront";

import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-sans",
  axes: ["wdth"]
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono"
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-serif"
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "LORIMER® — A Record, Not a Store",
    template: "%s | LORIMER®"
  },
  description:
    "LORIMER keeps garments as records. S/S24 — fourteen looks, one chapter, no noise. Deconstructed tailoring, wax-coated denim, the University of Lorimer.",
  openGraph: {
    title: "LORIMER® — A Record, Not a Store",
    description:
      "LORIMER keeps garments as records. S/S24 — fourteen looks, one chapter, no noise.",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "LORIMER® — A Record, Not a Store",
    description:
      "LORIMER keeps garments as records. S/S24 — fourteen looks, one chapter, no noise."
  }
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const chrome = await getSiteChromeData();

  return (
    <html lang="en" className={`${archivo.variable} ${plexMono.variable} ${cormorant.variable}`}>
      <body className="bg-paper font-sans text-ink antialiased">
        <SmoothScrollProvider>
          <ScrollProgress />
          <SiteCursor />
          <SiteNav />
          {children}
          <SiteFooter contact={chrome.contact} />
          <Grain />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
