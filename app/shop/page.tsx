import type { Metadata } from "next";
import { ShopView } from "@/components/shop/shop-view";
import { products, searchProducts } from "@/lib/data";
import { parseShopState, type ShopSearchParams } from "@/lib/shop-params";

export const metadata: Metadata = {
  title: "Shop All",
  description: "Browse the full MERIDIAN menswear collection.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<ShopSearchParams>;
}) {
  const sp = await searchParams;
  const { q, sort, filter } = sp;
  const initial = parseShopState(sp);

  let list = products;
  let title = "Shop All";
  let description: string | undefined =
    "The full collection — considered essentials, made to last.";

  if (q) {
    list = searchProducts(q);
    title = `Search: “${q}”`;
    description = `${list.length} ${list.length === 1 ? "result" : "results"} for your search.`;
  } else if (filter === "bestseller") {
    list = products.filter((p) => p.badges.includes("bestseller"));
    title = "Bestsellers";
    description = "The pieces our community reaches for, again and again.";
  } else if (filter === "sale") {
    title = "Sale";
    description = "Considered pieces, now at a considered price.";
  } else if (sort === "new") {
    title = "New Arrivals";
    description = "The latest additions to the collection.";
  }

  return (
    <ShopView
      products={list}
      title={title}
      description={description}
      initialSort={initial.sort}
      initialFilters={initial.filters}
    />
  );
}
