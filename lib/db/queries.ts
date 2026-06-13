import { eq, and, ne, inArray, desc, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  products,
  productImages,
  productVariants,
  reviews,
  orders,
  addresses,
  type OrderDbStatus,
} from "@/lib/db/schema";
import type {
  Address,
  CategorySlug,
  Order,
  OrderStatus,
  Product,
  Review,
} from "@/lib/types";

// Async accessors mirroring the old lib/data/products.ts API. They return the
// same `Product` shape the storefront components already consume.

type ProductRow = typeof products.$inferSelect & {
  images: (typeof productImages.$inferSelect)[];
  variants: (typeof productVariants.$inferSelect)[];
};

const withRelations = {
  images: true,
  variants: true,
} as const;

function toProduct(row: ProductRow, relatedIds: string[] = []): Product {
  // A size is sold out when every color variant for that size is at 0 stock.
  const soldOutSizes = row.sizes.filter((size) => {
    const ofSize = row.variants.filter((v) => v.size === size);
    return ofSize.length > 0 && ofSize.every((v) => v.stock <= 0);
  });

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    subtitle: row.subtitle,
    category: row.categorySlug as CategorySlug,
    price: row.price,
    compareAtPrice: row.compareAtPrice ?? undefined,
    colors: row.colors,
    sizes: row.sizes,
    images: [...row.images]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((i) => ({ url: i.url, thumb: i.thumb, alt: i.alt })),
    description: row.description,
    details: row.details,
    fit: row.fit,
    rating: row.rating,
    reviewCount: row.reviewCount,
    badges: row.badges,
    relatedIds,
    soldOutSizes: soldOutSizes.length > 0 ? soldOutSizes : undefined,
  };
}

export async function getAllProducts(): Promise<Product[]> {
  const rows = await db.query.products.findMany({
    where: eq(products.status, "active"),
    with: withRelations,
    orderBy: [asc(products.id)],
  });
  return rows.map((r) => toProduct(r));
}

export async function getProductBySlug(
  slug: string
): Promise<Product | undefined> {
  const row = await db.query.products.findFirst({
    where: and(eq(products.slug, slug), eq(products.status, "active")),
    with: withRelations,
  });
  return row ? toProduct(row) : undefined;
}

export async function getProductById(
  id: string
): Promise<Product | undefined> {
  const row = await db.query.products.findFirst({
    where: and(eq(products.id, id), eq(products.status, "active")),
    with: withRelations,
  });
  return row ? toProduct(row) : undefined;
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  const rows = await db.query.products.findMany({
    where: and(inArray(products.id, ids), eq(products.status, "active")),
    with: withRelations,
  });
  const byId = new Map(rows.map((r) => [r.id, toProduct(r)]));
  // Preserve caller order (wishlist order matters).
  return ids
    .map((id) => byId.get(id))
    .filter((p): p is Product => Boolean(p));
}

export async function getProductsByCategory(
  category: CategorySlug
): Promise<Product[]> {
  const rows = await db.query.products.findMany({
    where: and(
      eq(products.categorySlug, category),
      eq(products.status, "active")
    ),
    with: withRelations,
    orderBy: [asc(products.id)],
  });
  return rows.map((r) => toProduct(r));
}

export async function getRelatedProducts(product: Product): Promise<Product[]> {
  const rows = await db.query.products.findMany({
    where: and(
      eq(products.categorySlug, product.category),
      eq(products.status, "active"),
      ne(products.id, product.id)
    ),
    with: withRelations,
    orderBy: [asc(products.id)],
    limit: 4,
  });
  return rows.map((r) => toProduct(r));
}

export async function getNewArrivals(limit = 8): Promise<Product[]> {
  const all = await getAllProducts();
  return all.filter((p) => p.badges.includes("new")).slice(0, limit);
}

export async function getBestsellers(limit = 8): Promise<Product[]> {
  const all = await getAllProducts();
  return all.filter((p) => p.badges.includes("bestseller")).slice(0, limit);
}

export async function getOnSale(limit = 8): Promise<Product[]> {
  const all = await getAllProducts();
  return all.filter((p) => p.compareAtPrice).slice(0, limit);
}

export async function searchProducts(query: string): Promise<Product[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  // Catalog-sized search (tens of products) — filter in process, same
  // semantics as the old static helper. Revisit with SQL ilike/fts if the
  // catalog grows.
  const all = await getAllProducts();
  return all.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.subtitle.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.colors.some((c) => c.name.toLowerCase().includes(q))
  );
}

// ---------------------------------------------------------------------------
// Account
// ---------------------------------------------------------------------------

const DISPLAY_STATUS: Record<OrderDbStatus, OrderStatus> = {
  pending: "Processing",
  payment_failed: "Processing",
  paid: "Processing",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refund_requested: "Refunded",
  refunded: "Refunded",
};

export async function getOrdersForUser(userId: string): Promise<Order[]> {
  const rows = await db.query.orders.findMany({
    where: eq(orders.userId, userId),
    with: { items: true },
    orderBy: [desc(orders.placedAt)],
  });
  return rows.map((o) => ({
    id: o.number,
    date: o.placedAt.toISOString().slice(0, 10),
    status: DISPLAY_STATUS[o.status],
    items: o.items.map((i) => ({
      productId: i.productId ?? "",
      name: i.name,
      image: i.image,
      color: i.color,
      size: i.size,
      quantity: i.quantity,
      price: i.unitPrice,
    })),
    subtotal: o.subtotal,
    shipping: o.shipping,
    total: o.total,
    tracking: o.trackingNumber ?? undefined,
  }));
}

export async function getAddressesForUser(userId: string): Promise<Address[]> {
  const rows = await db.query.addresses.findMany({
    where: eq(addresses.userId, userId),
  });
  return rows.map((a) => ({
    id: a.id,
    label: a.label,
    name: a.name,
    line1: a.line1,
    line2: a.line2 ?? undefined,
    city: a.city,
    region: a.region,
    postal: a.postal,
    country: a.country,
    default: a.isDefault,
  }));
}

export async function getProductReviews(product: Product): Promise<Review[]> {
  const rows = await db.query.reviews.findMany({
    where: and(
      eq(reviews.productId, product.id),
      eq(reviews.status, "published")
    ),
    orderBy: [desc(reviews.date)],
  });
  return rows.map((r) => ({
    id: r.id,
    productId: r.productId,
    author: r.author,
    location: r.location,
    rating: r.rating,
    title: r.title,
    body: r.body,
    date: r.date,
    verified: r.verified,
  }));
}
