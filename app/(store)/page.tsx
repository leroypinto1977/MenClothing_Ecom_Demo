import { Hero } from "@/components/home/hero";
import { Assurances } from "@/components/home/assurances";
import { CategoryTiles } from "@/components/home/category-tiles";
import { ProductSection } from "@/components/home/product-section";
import { Lookbook } from "@/components/home/lookbook";
import { BrandStory } from "@/components/home/brand-story";
import {
  getAllProducts,
  getNewArrivals,
  getBestsellers,
} from "@/lib/db/queries";
import type { Product } from "@/lib/types";

export const revalidate = 60;

function pad(seed: Product[], all: Product[], count: number) {
  const seen = new Set<string>();
  return [...seed, ...all]
    .filter((p) => !seen.has(p.id) && seen.add(p.id))
    .slice(0, count);
}

export default async function Home() {
  const [arrivals, sellers, all] = await Promise.all([
    getNewArrivals(),
    getBestsellers(),
    getAllProducts(),
  ]);
  const newArrivals = pad(arrivals, all, 8);
  const bestsellers = pad(sellers, all, 8);

  return (
    <>
      <Hero />
      <Assurances />
      <CategoryTiles />
      <ProductSection
        eyebrow="Just In"
        title="New arrivals"
        description="The latest considered additions to the collection."
        href="/shop?sort=new"
        cta="Shop new in"
        products={newArrivals}
        priority
        className="pt-0"
      />
      <Lookbook />
      <ProductSection
        eyebrow="Tried & True"
        title="Bestsellers"
        description="The pieces our community reaches for, again and again."
        href="/shop?filter=bestseller"
        cta="Shop bestsellers"
        products={bestsellers}
      />
      <BrandStory />
    </>
  );
}
