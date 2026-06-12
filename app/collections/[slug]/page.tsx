import { notFound, redirect } from "next/navigation";

import { RouteState } from "@/components/route-state";

type CollectionRouteProps = {
  params: Promise<{ slug: string }>;
};

export default async function CollectionAliasPage({ params }: CollectionRouteProps) {
  const { slug } = await params;

  if (slug === "ss24") {
    redirect("/ss24");
  }

  if (slug === "aw24") {
    return (
      <>
        <main className="page-shell pb-24 pt-28">
          <div className="page-section">
            <RouteState
              eyebrow="Collection pending"
              title="A/W24 is listed in the archive but not published as a route yet."
              description="The alias exists so the chapter can be staged later without breaking the archive structure."
              actions={[
                { href: "/ss24", label: "View S/S24" },
                { href: "/shop", label: "Open products" }
              ]}
            />
          </div>
        </main>
      </>
    );
  }

  notFound();
}
