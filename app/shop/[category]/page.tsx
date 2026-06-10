import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShopView } from "@/components/shop/shop-view";
import { categories, getCategory, getProductsByCategory } from "@/lib/data";
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
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) notFound();

  const list = getProductsByCategory(category as CategorySlug);

  return (
    <ShopView
      products={list}
      title={cat.name}
      description={cat.description}
      lockedCategory
    />
  );
}
