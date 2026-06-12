"use client";

import { useMemo, useState } from "react";

import { ProductCard } from "@/components/product-card";
import { RouteState } from "@/components/route-state";
import type { GarmentCategory } from "@/lib/folio";
import type { StorefrontProduct } from "@/lib/types";
import { cn } from "@/lib/utils";

export type ArchiveRecord = StorefrontProduct & {
  category: GarmentCategory;
  material: string;
  lookNumber: number;
};

const CATEGORY_FILTERS: Array<GarmentCategory | "All"> = [
  "All",
  "Outerwear",
  "Tops",
  "Bottoms",
  "Dresses"
];

const STATUS_FILTERS = ["All", "In Stock", "Inquiry", "Archived"] as const;

/**
 * The Archive: live mono filter bar over the record grid. Filtering is
 * instant and client-side — seventeen records don't need a server.
 */
export function ArchiveGrid({ records }: { records: ArchiveRecord[] }) {
  const [category, setCategory] = useState<(typeof CATEGORY_FILTERS)[number]>("All");
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>("All");

  const filtered = useMemo(
    () =>
      records.filter(
        (record) =>
          (category === "All" || record.category === category) &&
          (status === "All" || record.statusLabel === status)
      ),
    [records, category, status]
  );

  return (
    <div>
      <div className="mb-10 flex flex-col gap-4 border-y border-ink py-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
          <span className="meta-label text-fog">TYPE</span>
          {CATEGORY_FILTERS.map((value) => (
            <FilterButton
              key={value}
              active={category === value}
              onClick={() => setCategory(value)}
              label={value}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
          <span className="meta-label text-fog">STATE</span>
          {STATUS_FILTERS.map((value) => (
            <FilterButton
              key={value}
              active={status === value}
              onClick={() => setStatus(value)}
              label={value}
            />
          ))}
          <span className="meta-label text-fog">
            {String(filtered.length).padStart(2, "0")} RECORDS
          </span>
        </div>
      </div>

      {filtered.length ? (
        <div className="grid gap-x-7 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((record, index) => (
            <ProductCard key={record.slug} product={record} index={index} />
          ))}
        </div>
      ) : (
        <RouteState
          eyebrow="No records"
          title="Nothing in the archive matches that combination."
          description="Clear a filter to bring the records back."
          inset
        />
      )}
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  label
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-cursor="FILTER"
      aria-pressed={active}
      className={cn(
        "meta-label transition-colors",
        active ? "bg-acid px-1.5 text-ink" : "text-fog hover:text-ink"
      )}
    >
      {label}
    </button>
  );
}
