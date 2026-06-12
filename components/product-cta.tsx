import Link from "next/link";

import type { StorefrontProduct } from "@/lib/types";

export function ProductCta({ product }: { product: StorefrontProduct }) {
  if (product.state === "available" && product.checkoutHref) {
    return (
      <Link
        href={product.checkoutHref}
        className="archive-link font-medium"
      >
        Add to cart
      </Link>
    );
  }

  return (
    <a
      href="#inquiry-form"
      className="archive-link font-medium"
    >
      {product.state === "archived" ? "Archive inquiry" : product.inquiryLabel}
    </a>
  );
}
