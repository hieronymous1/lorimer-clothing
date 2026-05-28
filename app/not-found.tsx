import { RouteState } from "@/components/route-state";
import { SiteNav } from "@/components/site-nav";
import { getSiteChromeData } from "@/lib/storefront";

export default async function NotFound() {
  const chrome = await getSiteChromeData();

  return (
    <>
      <SiteNav pathname="" logoSrc={chrome.logoSrc} />
      <main className="page-shell py-24">
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
