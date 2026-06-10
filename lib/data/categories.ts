import type { Category } from "@/lib/types";
import { photo } from "./images";

export const categories: Category[] = [
  {
    slug: "shirts",
    name: "Shirts",
    tagline: "Oxfords, linens & overshirts",
    description:
      "From garment-dyed oxfords to breathable linen camp collars — shirting cut to be worn, washed and worn again.",
    image: photo("shirts", 1).url,
  },
  {
    slug: "tees",
    name: "T-Shirts",
    tagline: "Heavyweight everyday essentials",
    description:
      "The foundation layer, perfected. Structured cottons and soft Pima in a quiet, considered palette.",
    image: photo("tees", 2).url,
  },
  {
    slug: "knitwear",
    name: "Knitwear",
    tagline: "Merino, lambswool & cashmere",
    description:
      "Fine-gauge merino, brushed lambswool and pure cashmere — knitted in Italy and Scotland to last for seasons.",
    image: photo("knitwear", 0).url,
  },
  {
    slug: "outerwear",
    name: "Outerwear",
    tagline: "Coats, jackets & overshirts",
    description:
      "Tailored overcoats and waxed field jackets built to weather the years and only improve with them.",
    image: photo("outerwear", 1).url,
  },
  {
    slug: "trousers",
    name: "Trousers",
    tagline: "Tailored, chino & denim",
    description:
      "Pleated wool tailoring, garment-dyed chinos and Japanese selvedge — trousers with a considered line.",
    image: photo("trousers", 0).url,
  },
  {
    slug: "accessories",
    name: "Accessories",
    tagline: "Leather, wool & canvas",
    description:
      "The finishing pieces — bridle leather belts, lambswool scarves and waxed canvas built for the long haul.",
    image: photo("accessories", 2).url,
  },
];

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
