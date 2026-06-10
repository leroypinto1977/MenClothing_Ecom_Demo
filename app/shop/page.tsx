import type { Metadata } from "next";
import { ShopView } from "@/components/shop/shop-view";
import { products, searchProducts } from "@/lib/data";

export const metadata: Metadata = {
  title: "Shop All",
  description: "Browse the full MERIDIAN menswear collection.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; filter?: string }>;
}) {
  const { q, sort, filter } = await searchParams;

  let list = products;
  let title = "Shop All";
  let description: string | undefined =
    "The full collection — considered essentials, made to last.";
  let initialSort = "featured";
  let initialOnSale = false;

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
    initialOnSale = true;
  } else if (sort === "new") {
    title = "New Arrivals";
    description = "The latest additions to the collection.";
    initialSort = "newest";
  }

  return (
    <ShopView
      products={list}
      title={title}
      description={description}
      initialSort={initialSort}
      initialOnSale={initialOnSale}
    />
  );
}
