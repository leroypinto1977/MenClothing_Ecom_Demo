import { and, asc, desc, eq, gte, inArray, lte, or, sql, ilike } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  orderEvents,
  orders,
  orderItems,
  products,
  productVariants,
  reviews,
  users,
  addresses,
  type OrderDbStatus,
} from "@/lib/db/schema";

/** Statuses that count as money in the door. */
export const REVENUE_STATUSES: OrderDbStatus[] = [
  "paid",
  "processing",
  "shipped",
  "delivered",
];

export const LOW_STOCK_THRESHOLD = 3;

function daysAgo(n: number) {
  return new Date(Date.now() - n * 86400000);
}

export async function getDashboardStats() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const week = daysAgo(7);
  const month = daysAgo(30);

  const [revenue] = await db
    .select({
      today: sql<number>`coalesce(sum(${orders.total}) filter (where ${orders.placedAt} >= ${todayStart}), 0)::int`,
      week: sql<number>`coalesce(sum(${orders.total}) filter (where ${orders.placedAt} >= ${week}), 0)::int`,
      month: sql<number>`coalesce(sum(${orders.total}) filter (where ${orders.placedAt} >= ${month}), 0)::int`,
      ordersMonth: sql<number>`(count(*) filter (where ${orders.placedAt} >= ${month}))::int`,
    })
    .from(orders)
    .where(inArray(orders.status, REVENUE_STATUSES));

  const [fulfill] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(orders)
    .where(inArray(orders.status, ["paid", "processing"]));

  const [lowStock] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(productVariants)
    .where(lte(productVariants.stock, LOW_STOCK_THRESHOLD));

  const recentOrders = await db.query.orders.findMany({
    orderBy: [desc(orders.placedAt)],
    limit: 8,
    columns: {
      id: true,
      number: true,
      email: true,
      status: true,
      total: true,
      placedAt: true,
    },
  });

  const topProducts = await db
    .select({
      name: orderItems.name,
      units: sql<number>`sum(${orderItems.quantity})::int`,
      revenue: sql<number>`sum(${orderItems.quantity} * ${orderItems.unitPrice})::int`,
    })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(
      and(gte(orders.placedAt, month), inArray(orders.status, REVENUE_STATUSES))
    )
    .groupBy(orderItems.name)
    .orderBy(desc(sql`sum(${orderItems.quantity} * ${orderItems.unitPrice})`))
    .limit(5);

  return {
    revenue,
    toFulfill: fulfill.count,
    lowStockCount: lowStock.count,
    recentOrders,
    topProducts,
  };
}

export async function getAdminProducts(search?: string) {
  const rows = await db.query.products.findMany({
    with: { variants: true, images: true },
    orderBy: [asc(products.name)],
  });
  const q = search?.trim().toLowerCase();
  const filtered = q
    ? rows.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.categorySlug.includes(q) ||
          p.slug.includes(q)
      )
    : rows;
  return filtered.map((p) => ({
    ...p,
    totalStock: p.variants.reduce((s, v) => s + v.stock, 0),
    lowVariants: p.variants.filter((v) => v.stock <= LOW_STOCK_THRESHOLD)
      .length,
  }));
}

export async function getAdminProduct(id: string) {
  return db.query.products.findFirst({
    where: eq(products.id, id),
    with: {
      variants: true,
      images: true,
    },
  });
}

// --- Orders -----------------------------------------------------------------

export const ORDER_STATUSES: OrderDbStatus[] = [
  "pending",
  "payment_failed",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refund_requested",
  "refunded",
];

export async function getAdminOrders(opts: {
  status?: string;
  search?: string;
}) {
  const conds = [];
  if (opts.status && ORDER_STATUSES.includes(opts.status as OrderDbStatus)) {
    conds.push(eq(orders.status, opts.status as OrderDbStatus));
  }
  if (opts.search?.trim()) {
    const q = `%${opts.search.trim()}%`;
    conds.push(or(ilike(orders.number, q), ilike(orders.email, q)));
  }
  return db.query.orders.findMany({
    where: conds.length ? and(...conds) : undefined,
    orderBy: [desc(orders.placedAt)],
    limit: 100,
    with: { items: { columns: { id: true } } },
  });
}

export async function getAdminOrder(id: string) {
  return db.query.orders.findFirst({
    where: eq(orders.id, id),
    with: {
      items: true,
      events: { orderBy: [desc(orderEvents.createdAt)] },
      payments: { with: { refunds: true } },
      user: { columns: { id: true, name: true, email: true } },
    },
  });
}

export async function getOrderCountsByStatus() {
  const rows = await db
    .select({
      status: orders.status,
      count: sql<number>`count(*)::int`,
    })
    .from(orders)
    .groupBy(orders.status);
  return Object.fromEntries(rows.map((r) => [r.status, r.count])) as Record<
    string,
    number
  >;
}

// --- Customers --------------------------------------------------------------

export async function getCustomers(search?: string) {
  const revenueOrder = sql`${orders.status} in ('paid','processing','shipped','delivered')`;
  const rows = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      banned: users.banned,
      createdAt: users.createdAt,
      orderCount: sql<number>`count(${orders.id}) filter (where ${revenueOrder})::int`,
      lifetimeValue: sql<number>`coalesce(sum(${orders.total}) filter (where ${revenueOrder}), 0)::int`,
    })
    .from(users)
    .leftJoin(orders, sql`${orders.userId} = ${users.id}`)
    .groupBy(users.id)
    .orderBy(desc(sql`coalesce(sum(${orders.total}) filter (where ${revenueOrder}), 0)`));

  const q = search?.trim().toLowerCase();
  return q
    ? rows.filter(
        (r) => r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
      )
    : rows;
}

export async function getCustomer(id: string) {
  const user = await db.query.users.findFirst({ where: eq(users.id, id) });
  if (!user) return null;
  const [custOrders, custAddresses] = await Promise.all([
    db.query.orders.findMany({
      where: eq(orders.userId, id),
      orderBy: [desc(orders.placedAt)],
      with: { items: { columns: { id: true } } },
    }),
    db.query.addresses.findMany({ where: eq(addresses.userId, id) }),
  ]);
  const ltv = custOrders
    .filter((o) => REVENUE_STATUSES.includes(o.status))
    .reduce((s, o) => s + o.total, 0);
  return { user, orders: custOrders, addresses: custAddresses, ltv };
}

// --- Reviews ----------------------------------------------------------------

export async function getReviewsForModeration(status?: string) {
  const rows = await db
    .select({
      id: reviews.id,
      author: reviews.author,
      rating: reviews.rating,
      title: reviews.title,
      body: reviews.body,
      date: reviews.date,
      status: reviews.status,
      productId: reviews.productId,
      productName: products.name,
      productSlug: products.slug,
    })
    .from(reviews)
    .innerJoin(products, eq(reviews.productId, products.id))
    .orderBy(desc(reviews.date));

  if (status && ["pending", "published", "rejected"].includes(status)) {
    return rows.filter((r) => r.status === status);
  }
  return rows;
}

export async function getReviewCounts() {
  const rows = await db
    .select({ status: reviews.status, count: sql<number>`count(*)::int` })
    .from(reviews)
    .groupBy(reviews.status);
  return Object.fromEntries(rows.map((r) => [r.status, r.count])) as Record<string, number>;
}

// --- Users / staff (admin only) ---------------------------------------------

export async function getStaffAndRoles() {
  return db.query.users.findMany({
    orderBy: [asc(users.name)],
    columns: {
      id: true,
      name: true,
      email: true,
      role: true,
      banned: true,
      createdAt: true,
    },
  });
}

export async function getInventory(opts: { low?: boolean; search?: string }) {
  const rows = await db
    .select({
      id: productVariants.id,
      sku: productVariants.sku,
      color: productVariants.color,
      size: productVariants.size,
      stock: productVariants.stock,
      productId: products.id,
      productName: products.name,
      category: products.categorySlug,
      status: products.status,
    })
    .from(productVariants)
    .innerJoin(products, eq(productVariants.productId, products.id))
    .where(
      opts.low
        ? lte(productVariants.stock, LOW_STOCK_THRESHOLD)
        : undefined
    )
    .orderBy(asc(productVariants.stock), asc(products.name));

  const q = opts.search?.trim().toLowerCase();
  return q
    ? rows.filter(
        (r) =>
          r.productName.toLowerCase().includes(q) ||
          r.sku.toLowerCase().includes(q)
      )
    : rows;
}
