import { RouteState } from "@/components/route-state";

export default function ProductNotFound() {
  return (
    <main className="page-shell py-24">
      <div className="page-section">
        <RouteState
          eyebrow="Product not found"
          title="This garment is not part of the published catalog."
          description="The product may still be in edit, archived outside the current release, or missing a storefront record."
          actions={[
            { href: "/shop", label: "Browse products" },
            { href: "/ss24", label: "View S/S24" }
          ]}
        />
      </div>
    </main>
  );
}
