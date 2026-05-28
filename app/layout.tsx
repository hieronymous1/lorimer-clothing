import type { Metadata } from "next";
import { Archivo_Narrow, Cormorant_Garamond } from "next/font/google";

import { SiteFooter } from "@/components/site-footer";
import { getSiteUrl } from "@/lib/site";
import { getSiteChromeData } from "@/lib/storefront";

import "./globals.css";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-serif"
});

const sans = Archivo_Narrow({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans"
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Lorimer",
    template: "%s | Lorimer"
  },
  description:
    "Lorimer is an editorial fashion storefront shaped like a runway archive, with quiet product handling and cinematic pacing.",
  openGraph: {
    title: "Lorimer",
    description:
      "Editorial fashion storefront shaped like a runway archive, with quiet product handling and cinematic pacing.",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Lorimer",
    description:
      "Editorial fashion storefront shaped like a runway archive, with quiet product handling and cinematic pacing."
  }
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const chrome = await getSiteChromeData();

  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body className="bg-shell font-[var(--font-serif)] text-ink antialiased">
        {children}
        <SiteFooter contact={chrome.contact} />
      </body>
    </html>
  );
}
