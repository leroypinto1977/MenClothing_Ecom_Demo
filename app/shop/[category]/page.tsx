import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShopView } from "@/components/shop/shop-view";
import { categories, getCategory, getProductsByCategory } from "@/lib/data";
import { parseShopState, type ShopSearchParams } from "@/lib/shop-params";
import type { CategorySlug } from "@/lib/types";

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) return { title: "Shop" };
  return { title: cat.name, description: cat.description };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<ShopSearchParams>;
}) {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) notFound();

  const initial = parseShopState(await searchParams);
  // The category is fixed by the route — never carry one in filter state.
  initial.filters.categories = [];

  const list = getProductsByCategory(category as CategorySlug);

  return (
    <ShopView
      products={list}
      title={cat.name}
      description={cat.description}
      lockedCategory
      initialSort={initial.sort}
      initialFilters={initial.filters}
    />
  );
}
