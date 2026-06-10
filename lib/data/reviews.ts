import type { Product, Review } from "@/lib/types";

interface ReviewSeed {
  author: string;
  location: string;
  rating: number;
  title: string;
  body: string;
  date: string;
}

const SEEDS: ReviewSeed[] = [
  {
    author: "James W.",
    location: "London, UK",
    rating: 5,
    title: "Exactly what I hoped for",
    body: "The quality is immediately obvious — the fabric has real weight and the cut is spot on. This has quickly become something I reach for every week.",
    date: "2026-05-12",
  },
  {
    author: "Daniel R.",
    location: "Brooklyn, NY",
    rating: 5,
    title: "Worth every penny",
    body: "I was hesitant at the price but the construction justifies it. Clean finishing inside and out, and it has held up perfectly after repeated washes.",
    date: "2026-04-28",
  },
  {
    author: "Marcus T.",
    location: "Melbourne, AU",
    rating: 4,
    title: "Beautiful, runs slightly large",
    body: "Lovely material and colour — true to the photos. I'd size down if you're between sizes, the body is a touch roomier than expected.",
    date: "2026-04-09",
  },
  {
    author: "Henrik L.",
    location: "Copenhagen, DK",
    rating: 5,
    title: "Understated and well made",
    body: "Minimal, neutral, and quietly premium. It pairs with everything I own and the colour is even nicer in person.",
    date: "2026-03-22",
  },
  {
    author: "Olu A.",
    location: "Toronto, CA",
    rating: 5,
    title: "Best in my wardrobe",
    body: "Fit, feel, and finish are all excellent. The kind of piece you notice every time you put it on. Shipping was quick too.",
    date: "2026-03-03",
  },
  {
    author: "Tomás G.",
    location: "Lisbon, PT",
    rating: 4,
    title: "Great everyday piece",
    body: "Comfortable from day one and the details feel considered. Knocked off a star only because I wish it came in one more colour.",
    date: "2026-02-15",
  },
  {
    author: "Wei C.",
    location: "Singapore",
    rating: 5,
    title: "Premium feel, no fuss",
    body: "Looks far more expensive than it is. Holds its shape, drapes well, and the fabric breathes. Couldn't be happier.",
    date: "2026-01-30",
  },
  {
    author: "Eli M.",
    location: "Austin, TX",
    rating: 5,
    title: "Repeat customer",
    body: "Third piece from MERIDIAN and the consistency is what keeps me coming back. Sizing is reliable and the quality never dips.",
    date: "2026-01-11",
  },
];

/** Deterministically derive a review set for a product from its review count. */
export function getProductReviews(product: Product): Review[] {
  const seedIndex = product.id
    .split("")
    .reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const count = Math.min(5, Math.max(3, product.reviewCount % 6 || 3));
  const reviews: Review[] = [];
  for (let i = 0; i < count; i++) {
    const seed = SEEDS[(seedIndex + i) % SEEDS.length];
    reviews.push({
      id: `${product.id}-r${i + 1}`,
      productId: product.id,
      author: seed.author,
      location: seed.location,
      rating: seed.rating,
      title: seed.title,
      body: seed.body,
      date: seed.date,
      verified: true,
    });
  }
  return reviews;
}
