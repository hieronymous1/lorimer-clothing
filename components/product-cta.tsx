import Link from "next/link";

import type { StorefrontProduct } from "@/lib/types";

export function ProductCta({ product }: { product: StorefrontProduct }) {
  if (product.state === "available" && product.checkoutHref) {
    return (
      <Link
        href={product.checkoutHref}
        className="inline-flex border-b border-ink pb-1 text-[0.82rem] font-medium uppercase tracking-[0.18em] text-ink transition hover:opacity-70"
      >
        Add to cart
      </Link>
    );
  }

  return (
    <a
      href="#inquiry-form"
      className="inline-flex border-b border-ink pb-1 text-[0.82rem] font-medium uppercase tracking-[0.18em] text-ink transition hover:opacity-70"
    >
      {product.state === "archived" ? "Archive inquiry" : product.inquiryLabel}
    </a>
  );
}
