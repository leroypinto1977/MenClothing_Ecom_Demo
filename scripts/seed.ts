/**
 * Seeds Neon Postgres from the original mock data in lib/data, plus a
 * deterministic batch of historical orders so the admin analytics have
 * something to show. Idempotent: wipes commerce tables and re-inserts.
 *
 * Run with: npm run db:seed
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import type { PgTable } from "drizzle-orm/pg-core";
import * as schema from "../lib/db/schema";
import { products as mockProducts } from "../lib/data/products";
import { categories as mockCategories } from "../lib/data/categories";
import { orders as mockOrders } from "../lib/data/orders";
import { currentUser } from "../lib/data/user";
import { getProductReviews } from "../lib/data/reviews";
import type { Product } from "../lib/types";
import type { AddressSnapshot, OrderDbStatus } from "../lib/db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

// Deterministic PRNG so re-seeding produces identical data.
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(42);
const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
const randInt = (min: number, max: number) =>
  min + Math.floor(rand() * (max - min + 1));

function hashCode(s: string) {
  let h = 0;
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return Math.abs(h);
}

function skuFor(productId: string, color: string, size: string) {
  const norm = (v: string) =>
    v.toUpperCase().replace(/[^A-Z0-9]+/g, "").slice(0, 8);
  return `MER-${productId.toUpperCase()}-${norm(color)}-${norm(size)}`;
}

async function chunkedInsert<T extends PgTable>(
  table: T,
  rows: T["$inferInsert"][],
  size = 100
) {
  for (let i = 0; i < rows.length; i += size) {
    await db.insert(table).values(rows.slice(i, i + size));
  }
}

async function wipe() {
  // Order matters: children before parents.
  await db.delete(schema.refunds);
  await db.delete(schema.payments);
  await db.delete(schema.orderEvents);
  await db.delete(schema.orderItems);
  await db.delete(schema.orders);
  await db.delete(schema.reviews);
  await db.delete(schema.productVariants);
  await db.delete(schema.productImages);
  await db.delete(schema.products);
  await db.delete(schema.categories);
  await db.delete(schema.addresses);
  await db.delete(schema.sessions);
  await db.delete(schema.accounts);
  await db.delete(schema.verifications);
  await db.delete(schema.users);
  await db.delete(schema.contentBlocks);
}

async function seedCatalog() {
  await db.insert(schema.categories).values(
    mockCategories.map((c, i) => ({
      slug: c.slug,
      name: c.name,
      tagline: c.tagline,
      description: c.description,
      image: c.image,
      sortOrder: i,
    }))
  );

  await chunkedInsert(
    schema.products,
    mockProducts.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      subtitle: p.subtitle,
      categorySlug: p.category,
      price: p.price,
      compareAtPrice: p.compareAtPrice ?? null,
      colors: p.colors,
      sizes: p.sizes,
      description: p.description,
      details: p.details,
      fit: p.fit,
      badges: p.badges,
      rating: p.rating,
      reviewCount: p.reviewCount,
      status: "active" as const,
    }))
  );

  await chunkedInsert(
    schema.productImages,
    mockProducts.flatMap((p) =>
      p.images.map((img, i) => ({
        productId: p.id,
        url: img.url,
        thumb: img.thumb,
        alt: img.alt,
        sortOrder: i,
      }))
    )
  );

  await chunkedInsert(
    schema.productVariants,
    mockProducts.flatMap((p) =>
      p.colors.flatMap((color) =>
        p.sizes.map((size) => {
          const sku = skuFor(p.id, color.name, size);
          const soldOut = p.soldOutSizes?.includes(size);
          return {
            productId: p.id,
            color: color.name,
            size,
            sku,
            stock: soldOut ? 0 : 4 + (hashCode(sku) % 25),
          };
        })
      )
    )
  );

  await chunkedInsert(
    schema.reviews,
    mockProducts.flatMap((p) =>
      getProductReviews(p).map((r) => ({
        id: r.id,
        productId: r.productId,
        author: r.author,
        location: r.location,
        rating: r.rating,
        title: r.title,
        body: r.body,
        date: r.date,
        verified: r.verified,
        status: "published" as const,
      }))
    )
  );
}

const EXTRA_CUSTOMERS = [
  { id: "user-arjun", name: "Arjun Mehta", email: "arjun.mehta@example.com" },
  { id: "user-priya", name: "Priya Sharma", email: "priya.sharma@example.com" },
  { id: "user-rahul", name: "Rahul Nair", email: "rahul.nair@example.com" },
  { id: "user-vikram", name: "Vikram Iyer", email: "vikram.iyer@example.com" },
  { id: "user-ananya", name: "Ananya Rao", email: "ananya.rao@example.com" },
  { id: "user-karan", name: "Karan Kapoor", email: "karan.kapoor@example.com" },
];

const SNAPSHOT_ADDRESSES: AddressSnapshot[] = [
  { name: "", line1: "14 Pali Hill Road", city: "Mumbai", region: "Maharashtra", postal: "400050", country: "India" },
  { name: "", line1: "221 Indiranagar 100ft Road", city: "Bengaluru", region: "Karnataka", postal: "560038", country: "India" },
  { name: "", line1: "8 Hauz Khas Village", city: "New Delhi", region: "Delhi", postal: "110016", country: "India" },
  { name: "", line1: "45 Boat Club Road", city: "Chennai", region: "Tamil Nadu", postal: "600028", country: "India" },
  { name: "", line1: "12 Koregaon Park Lane 5", city: "Pune", region: "Maharashtra", postal: "411001", country: "India" },
];

async function seedUsers() {
  const now = new Date();
  await db.insert(schema.users).values([
    {
      id: "user-james",
      name: currentUser.name,
      email: currentUser.email,
      emailVerified: true,
      role: "customer",
      createdAt: new Date(currentUser.memberSince),
      updatedAt: now,
    },
    {
      // Placeholder admin — Phase 2 attaches real credentials via Better Auth.
      id: "user-admin",
      name: "Meridian Admin",
      email: "admin@meridian.demo",
      emailVerified: true,
      role: "admin",
      createdAt: new Date("2025-11-01"),
      updatedAt: now,
    },
    ...EXTRA_CUSTOMERS.map((c, i) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      emailVerified: true,
      role: "customer" as const,
      createdAt: new Date(2025, 10 + (i % 3), 3 + i * 4),
      updatedAt: now,
    })),
  ]);

  await db.insert(schema.addresses).values(
    currentUser.addresses.map((a) => ({
      id: a.id,
      userId: "user-james",
      label: a.label,
      name: a.name,
      line1: a.line1,
      line2: a.line2 ?? null,
      city: a.city,
      region: a.region,
      postal: a.postal,
      country: a.country,
      isDefault: a.default,
    }))
  );
}

interface EventSpec {
  type: "status_change" | "tracking_added";
  from?: string;
  to?: string;
  message: string;
  at: Date;
}

function eventChain(
  status: OrderDbStatus,
  placedAt: Date,
  tracking?: string
): EventSpec[] {
  const day = 24 * 60 * 60 * 1000;
  const at = (d: number) => new Date(placedAt.getTime() + d * day);
  const chain: EventSpec[] = [
    { type: "status_change", to: "pending", message: "Order placed", at: placedAt },
  ];
  const push = (from: string, to: string, msg: string, d: number) =>
    chain.push({ type: "status_change", from, to, message: msg, at: at(d) });

  if (status === "cancelled") {
    push("pending", "cancelled", "Cancelled before payment", 0.1);
    return chain;
  }
  push("pending", "paid", "Payment captured", 0.01);
  if (status === "paid") return chain;
  push("paid", "processing", "Fulfillment started", 1);
  if (status === "processing") return chain;
  if (tracking) {
    chain.push({
      type: "tracking_added",
      message: `Tracking number ${tracking} added`,
      at: at(2),
    });
  }
  push("processing", "shipped", "Package handed to carrier", 2);
  if (status === "shipped") return chain;
  push("shipped", "delivered", "Delivered", 5);
  if (status === "refunded") {
    push("delivered", "refunded", "Refund issued", 9);
  }
  return chain;
}

interface OrderSeed {
  id: string;
  number: string;
  userId: string | null;
  email: string;
  name: string;
  status: OrderDbStatus;
  placedAt: Date;
  shipping: number;
  taxRate: number;
  items: { product: Product; color: string; size: string; quantity: number }[];
  carrier?: string;
  tracking?: string;
  address: AddressSnapshot;
}

async function insertOrder(seed: OrderSeed) {
  const subtotal = seed.items.reduce(
    (s, i) => s + i.product.price * i.quantity,
    0
  );
  const tax = Math.round(subtotal * seed.taxRate);
  const total = subtotal + tax + seed.shipping;
  const refunded = seed.status === "refunded";

  await db.insert(schema.orders).values({
    id: seed.id,
    number: seed.number,
    userId: seed.userId,
    email: seed.email,
    status: seed.status,
    subtotal,
    shipping: seed.shipping,
    tax,
    total,
    shippingAddress: { ...seed.address, name: seed.name },
    deliveryMethod: seed.shipping > 0 ? "express" : "standard",
    carrier: seed.carrier ?? null,
    trackingNumber: seed.tracking ?? null,
    placedAt: seed.placedAt,
    updatedAt: seed.placedAt,
  });

  await db.insert(schema.orderItems).values(
    seed.items.map((i) => ({
      orderId: seed.id,
      productId: i.product.id,
      variantSku: skuFor(i.product.id, i.color, i.size),
      name: i.product.name,
      image: i.product.images[0].thumb,
      color: i.color,
      size: i.size,
      quantity: i.quantity,
      unitPrice: i.product.price,
    }))
  );

  await db.insert(schema.orderEvents).values(
    eventChain(seed.status, seed.placedAt, seed.tracking).map((e) => ({
      orderId: seed.id,
      type: e.type,
      fromStatus: e.from ?? null,
      toStatus: e.to ?? null,
      message: e.message,
      createdAt: e.at,
    }))
  );

  if (seed.status !== "pending" && seed.status !== "cancelled") {
    const paymentId = `pay-${seed.id}`;
    await db.insert(schema.payments).values({
      id: paymentId,
      orderId: seed.id,
      provider: "demo",
      amount: total,
      status: refunded ? "refunded" : "captured",
      method: pick(["upi", "card", "netbanking"]),
      createdAt: seed.placedAt,
      updatedAt: seed.placedAt,
    });
    if (refunded) {
      await db.insert(schema.refunds).values({
        id: `ref-${seed.id}`,
        paymentId,
        amount: total,
        reason: "Customer return",
        createdAt: new Date(seed.placedAt.getTime() + 9 * 86400000),
      });
    }
  }
}

async function seedOrders() {
  const productById = new Map(mockProducts.map((p) => [p.id, p]));

  // 1. James's three original mock orders (statuses mapped to the new machine).
  const statusMap: Record<string, OrderDbStatus> = {
    Processing: "processing",
    Shipped: "shipped",
    "In transit": "shipped",
    Delivered: "delivered",
  };
  const homeAddr = currentUser.addresses[0];
  for (const o of mockOrders) {
    await insertOrder({
      id: `ord-${o.id.toLowerCase()}`,
      number: o.id,
      userId: "user-james",
      email: currentUser.email,
      name: currentUser.name,
      status: statusMap[o.status],
      placedAt: new Date(`${o.date}T10:30:00Z`),
      shipping: o.shipping,
      taxRate: 0, // mock totals had no tax line; keep them byte-identical
      items: o.items.map((i) => ({
        product: productById.get(i.productId)!,
        color: i.color,
        size: i.size,
        quantity: i.quantity,
      })),
      carrier: "Royal Mail",
      tracking: o.tracking,
      address: {
        name: homeAddr.name,
        line1: homeAddr.line1,
        line2: homeAddr.line2,
        city: homeAddr.city,
        region: homeAddr.region,
        postal: homeAddr.postal,
        country: homeAddr.country,
      },
    });
  }

  // 2. Generated history for analytics: ~48 orders over the last ~6 months.
  const carriers = ["Delhivery", "Blue Dart", "India Post"];
  const now = new Date("2026-06-13T00:00:00Z");
  for (let i = 0; i < 48; i++) {
    const daysAgo = randInt(0, 180);
    const placedAt = new Date(now.getTime() - daysAgo * 86400000);
    placedAt.setUTCHours(randInt(6, 20), randInt(0, 59), 0, 0);

    // Recent orders are still in flight; older ones nearly all delivered.
    let status: OrderDbStatus;
    if (daysAgo < 2) status = pick(["pending", "paid", "paid", "processing"]);
    else if (daysAgo < 7) status = pick(["processing", "shipped", "shipped", "delivered"]);
    else {
      const roll = rand();
      status = roll < 0.86 ? "delivered" : roll < 0.93 ? "cancelled" : "refunded";
    }

    const isGuest = rand() < 0.35;
    const customer = isGuest
      ? { id: null, name: `Guest ${i + 1}`, email: `guest${i + 1}@example.com` }
      : (() => {
          const c = pick(EXTRA_CUSTOMERS);
          return { id: c.id, name: c.name, email: c.email };
        })();

    const itemCount = randInt(1, 3);
    const chosen = new Set<string>();
    const items: OrderSeed["items"] = [];
    for (let j = 0; j < itemCount; j++) {
      const product = pick(mockProducts);
      if (chosen.has(product.id)) continue;
      chosen.add(product.id);
      items.push({
        product,
        color: pick(product.colors).name,
        size: pick(product.sizes.filter((s) => !product.soldOutSizes?.includes(s)) || product.sizes),
        quantity: randInt(1, 2),
      });
    }

    const subtotal = items.reduce((s, x) => s + x.product.price * x.quantity, 0);
    const shipped = ["shipped", "delivered", "refunded"].includes(status);
    await insertOrder({
      id: `ord-gen-${i + 1}`,
      number: `MER-${11000 + i}`,
      userId: customer.id,
      email: customer.email,
      name: customer.name,
      status,
      placedAt,
      shipping: subtotal >= 12000 ? 0 : rand() < 0.2 ? 1200 : 0,
      taxRate: 0.18,
      items,
      carrier: shipped ? pick(carriers) : undefined,
      tracking: shipped ? `IN-${randInt(1000, 9999)}-${randInt(1000, 9999)}` : undefined,
      address: pick(SNAPSHOT_ADDRESSES),
    });
  }
}

async function seedContent() {
  await db.insert(schema.contentBlocks).values([
    {
      key: "home.hero",
      data: {
        eyebrow: "Autumn / Winter 2026",
        title: "Modern essentials, refined.",
        subtitle:
          "Considered, well-made menswear designed to be worn season after season — crafted in Europe from natural fibres and built to last.",
        primaryCta: "Shop the collection",
        primaryHref: "/shop",
        secondaryCta: "Explore knitwear",
        secondaryHref: "/shop/knitwear",
      },
    },
    {
      key: "announcement",
      data: {
        messages: [
          "Complimentary shipping on orders over ₹12,000",
          "Free 30-day returns — wear it, live in it, decide later",
          "New season knitwear has landed",
        ],
      },
    },
    {
      key: "settings",
      data: {
        storeName: "MERIDIAN",
        supportEmail: "support@meridian.demo",
        freeShippingThreshold: 12000,
        standardShipping: 600,
        expressShipping: 1200,
        taxRatePct: 8,
      },
    },
  ]);
}

async function main() {
  console.log("Wiping existing data…");
  await wipe();
  console.log("Seeding catalog…");
  await seedCatalog();
  console.log("Seeding users…");
  await seedUsers();
  console.log("Seeding orders…");
  await seedOrders();
  console.log("Seeding content…");
  await seedContent();

  const [{ count: productCount }] = (await sql`SELECT count(*)::int AS count FROM products`) as { count: number }[];
  const [{ count: variantCount }] = (await sql`SELECT count(*)::int AS count FROM product_variants`) as { count: number }[];
  const [{ count: orderCount }] = (await sql`SELECT count(*)::int AS count FROM orders`) as { count: number }[];
  console.log(`Done. ${productCount} products, ${variantCount} variants, ${orderCount} orders.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
