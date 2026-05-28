import Link from "next/link";

import { SiteImage } from "@/components/site-image";
import type { StorefrontProduct } from "@/lib/types";

export function ProductCard({ product }: { product: StorefrontProduct }) {
  return (
    <article className="group flex flex-col gap-4">
      <Link href={`/product/${product.slug}`} className="space-y-4">
        <SiteImage
          src={product.cover}
          alt={product.coverAlt}
          className="aspect-[0.78] transition duration-500 group-hover:scale-[1.01]"
          sizes="(min-width: 1280px) 28vw, (min-width: 768px) 40vw, 92vw"
        />
        <div className="space-y-2">
          <p className="text-[0.72rem] uppercase tracking-[0.18em] text-fog">{product.season}</p>
          <h3 className="max-w-[22ch] text-xl leading-tight text-ink">{product.title}</h3>
          <div className="flex items-center justify-between gap-4 text-sm text-fog">
            <p>{product.priceLabel}</p>
            <p className="uppercase tracking-[0.18em]">{product.state.replace("-", " ")}</p>
          </div>
        </div>
      </Link>
    </article>
  );
}
