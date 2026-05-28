import { RouteLoading } from "@/components/route-loading";

export default function Loading() {
  return <RouteLoading eyebrow="Collection loading" title="Checking the requested chapter against the archive." blocks={2} />;
}
