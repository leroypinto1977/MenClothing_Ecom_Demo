import { and, gte, inArray, lt, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders, orderItems, payments, refunds } from "@/lib/db/schema";
import { REVENUE_STATUSES } from "@/lib/admin/queries";

export const PERIODS = {
  "7d": { label: "7 days", days: 7 },
  "30d": { label: "30 days", days: 30 },
  "90d": { label: "90 days", days: 90 },
  "365d": { label: "12 months", days: 365 },
} as const;

export type PeriodKey = keyof typeof PERIODS;

export function resolvePeriod(key?: string): PeriodKey {
  return key && key in PERIODS ? (key as PeriodKey) : "30d";
}

function startNDaysAgo(days: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days + 1);
  return d;
}

function pctDelta(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 100);
}

async function kpiForRange(start: Date, end: Date) {
  const [row] = await db
    .select({
      revenue: sql<number>`coalesce(sum(${orders.total}), 0)::int`,
      orders: sql<number>`count(*)::int`,
      tax: sql<number>`coalesce(sum(${orders.tax}), 0)::int`,
    })
    .from(orders)
    .where(
      and(
        inArray(orders.status, REVENUE_STATUSES),
        gte(orders.placedAt, start),
        lt(orders.placedAt, end)
      )
    );

  const [units] = await db
    .select({ units: sql<number>`coalesce(sum(${orderItems.quantity}), 0)::int` })
    .from(orderItems)
    .innerJoin(orders, sql`${orderItems.orderId} = ${orders.id}`)
    .where(
      and(
        inArray(orders.status, REVENUE_STATUSES),
        gte(orders.placedAt, start),
        lt(orders.placedAt, end)
      )
    );

  return { ...row, units: units.units };
}

export async function getAnalytics(period: PeriodKey) {
  const { days } = PERIODS[period];
  const now = new Date();
  const start = startNDaysAgo(days);
  const prevStart = startNDaysAgo(days * 2);

  const [current, previous] = await Promise.all([
    kpiForRange(start, now),
    kpiForRange(prevStart, start),
  ]);

  // Refunds in the current period.
  const [refundRow] = await db
    .select({ total: sql<number>`coalesce(sum(${refunds.amount}), 0)::int` })
    .from(refunds)
    .where(gte(refunds.createdAt, start));

  // Revenue over time (daily buckets).
  const series = await db
    .select({
      day: sql<string>`to_char(date_trunc('day', ${orders.placedAt}), 'YYYY-MM-DD')`,
      revenue: sql<number>`coalesce(sum(${orders.total}), 0)::int`,
      orders: sql<number>`count(*)::int`,
    })
    .from(orders)
    .where(
      and(inArray(orders.status, REVENUE_STATUSES), gte(orders.placedAt, start))
    )
    .groupBy(sql`date_trunc('day', ${orders.placedAt})`)
    .orderBy(sql`date_trunc('day', ${orders.placedAt})`);

  // Revenue by category.
  const byCategory = await db
    .select({
      category: sql<string>`split_part(${orderItems.variantSku}, '-', 2)`,
      revenue: sql<number>`coalesce(sum(${orderItems.quantity} * ${orderItems.unitPrice}), 0)::int`,
    })
    .from(orderItems)
    .innerJoin(orders, sql`${orderItems.orderId} = ${orders.id}`)
    .where(
      and(inArray(orders.status, REVENUE_STATUSES), gte(orders.placedAt, start))
    )
    .groupBy(sql`split_part(${orderItems.variantSku}, '-', 2)`)
    .orderBy(sql`sum(${orderItems.quantity} * ${orderItems.unitPrice}) desc`);

  // New vs returning: for each user with an order in the period, was their
  // first-ever order inside the period (new) or before it (returning)?
  // Computed in-process — registered-customer counts are small.
  const userOrders = await db
    .select({ userId: orders.userId, placedAt: orders.placedAt })
    .from(orders)
    .where(inArray(orders.status, REVENUE_STATUSES));

  const firstOrderByUser = new Map<string, Date>();
  const orderedInPeriod = new Set<string>();
  for (const o of userOrders) {
    if (!o.userId) continue;
    const prev = firstOrderByUser.get(o.userId);
    if (!prev || o.placedAt < prev) firstOrderByUser.set(o.userId, o.placedAt);
    if (o.placedAt >= start) orderedInPeriod.add(o.userId);
  }
  let newCustomers = 0;
  let returningCustomers = 0;
  for (const userId of orderedInPeriod) {
    const first = firstOrderByUser.get(userId)!;
    if (first >= start) newCustomers++;
    else returningCustomers++;
  }

  const grossRevenue = current.revenue;
  const netRevenue = grossRevenue - refundRow.total;
  const aov = current.orders > 0 ? Math.round(grossRevenue / current.orders) : 0;
  const prevAov =
    previous.orders > 0 ? Math.round(previous.revenue / previous.orders) : 0;

  return {
    period,
    kpis: {
      gross: { value: grossRevenue, delta: pctDelta(grossRevenue, previous.revenue) },
      net: { value: netRevenue, delta: null as number | null },
      orders: { value: current.orders, delta: pctDelta(current.orders, previous.orders) },
      aov: { value: aov, delta: pctDelta(aov, prevAov) },
      units: { value: current.units, delta: pctDelta(current.units, previous.units) },
      tax: { value: current.tax, delta: pctDelta(current.tax, previous.tax) },
      refunds: { value: refundRow.total, delta: null as number | null },
    },
    series,
    byCategory,
    customers: {
      new: newCustomers,
      returning: returningCustomers,
    },
  };
}

/** Flat transaction ledger (payments + refunds) for CSV export. */
export async function getTransactionLedger(period: PeriodKey) {
  const start = startNDaysAgo(PERIODS[period].days);
  const pays = await db
    .select({
      date: payments.createdAt,
      type: sql<string>`'payment'`,
      reference: payments.providerPaymentId,
      provider: payments.provider,
      status: payments.status,
      amount: payments.amount,
    })
    .from(payments)
    .where(gte(payments.createdAt, start))
    .orderBy(sql`${payments.createdAt} desc`);
  return pays;
}
