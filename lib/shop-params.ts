import type { ShopFilters } from "@/lib/types";

/**
 * URL query params understood by the shop pages. Filter state is kept in the
 * URL (comma-separated lists) so filtered views survive refresh and can be
 * shared; `q` and `filter` narrow the product list server-side.
 */
export interface ShopSearchParams {
  q?: string;
  sort?: string;
  filter?: string;
  cat?: string;
  size?: string;
  color?: string;
  price?: string;
  fit?: string;
  sale?: string;
}

const SORT_IDS = new Set([
  "featured",
  "newest",
  "price-asc",
  "price-desc",
  "rating",
]);

const split = (value?: string) =>
  value ? value.split(",").map((v) => v.trim()).filter(Boolean) : [];

export function parseShopState(sp: ShopSearchParams): {
  filters: ShopFilters;
  sort: string;
} {
  // `sort=new` is the marketing entry-point (New Arrivals); map it to the
  // real sort id. Anything unrecognised falls back to featured.
  const sort =
    sp.sort === "new"
      ? "newest"
      : sp.sort && SORT_IDS.has(sp.sort)
        ? sp.sort
        : "featured";

  return {
    filters: {
      categories: split(sp.cat),
      sizes: split(sp.size),
      colors: split(sp.color),
      price: split(sp.price),
      fits: split(sp.fit),
      onSale: sp.sale === "1" || sp.filter === "sale",
    },
    sort,
  };
}
