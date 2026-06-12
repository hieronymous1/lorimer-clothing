import { RouteState } from "@/components/route-state";

export default async function NotFound() {
  return (
    <>
      <main className="page-shell py-24 pt-28">
        <div className="page-section">
          <RouteState
            eyebrow="Not found"
            title="This route sits outside the current archive."
            description="The requested page does not exist in the current Lorimer storefront baseline, or it has not been staged into the published chapter list yet."
            actions={[
              { href: "/", label: "Return home" },
              { href: "/shop", label: "Open products" }
            ]}
          />
        </div>
      </main>
    </>
  );
}
