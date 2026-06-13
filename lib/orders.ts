import "server-only";
import { createHmac } from "node:crypto";
import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  orderEvents,
  orderItems,
  orders,
  payments,
  productVariants,
  type OrderDbStatus,
} from "@/lib/db/schema";
import {
  sendOrderConfirmation,
  sendShippingUpdate,
  sendDeliveredUpdate,
  sendOrderCancelled,
  sendPaymentFailed,
} from "@/lib/notify";

// --- Order numbers ----------------------------------------------------------

/** Next sequential MER-##### number, continuing past the seeded range. */
export async function nextOrderNumber(): Promise<string> {
  const [row] = await db
    .select({
      max: sql<number>`coalesce(max((substring(${orders.number} from 5))::int), 10000)`,
    })
    .from(orders);
  return `MER-${(row?.max ?? 10000) + 1}`;
}

// --- Confirmation tokens (guard guest order lookup) -------------------------

function tokenSecret() {
  return process.env.BETTER_AUTH_SECRET ?? "meridian-dev-secret";
}

export function signOrderToken(orderNumber: string): string {
  return createHmac("sha256", tokenSecret())
    .update(orderNumber)
    .digest("hex")
    .slice(0, 24);
}

export function verifyOrderToken(orderNumber: string, token: string): boolean {
  const expected = signOrderToken(orderNumber);
  if (expected.length !== token.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++)
    diff |= expected.charCodeAt(i) ^ token.charCodeAt(i);
  return diff === 0;
}

// --- State machine ----------------------------------------------------------

const TRANSITIONS: Record<OrderDbStatus, OrderDbStatus[]> = {
  pending: ["paid", "payment_failed", "cancelled"],
  payment_failed: ["paid", "cancelled"],
  paid: ["processing", "cancelled", "refund_requested"],
  processing: ["shipped", "cancelled", "refund_requested"],
  shipped: ["delivered", "refund_requested"],
  delivered: ["refund_requested"],
  refund_requested: ["refunded", "delivered"],
  refunded: [],
  cancelled: [],
};

export function canTransition(from: OrderDbStatus, to: OrderDbStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export async function recordEvent(opts: {
  orderId: string;
  type: "status_change" | "note" | "email_sent" | "tracking_added";
  fromStatus?: OrderDbStatus | null;
  toStatus?: OrderDbStatus | null;
  message: string;
  actorUserId?: string | null;
}) {
  await db.insert(orderEvents).values({
    orderId: opts.orderId,
    type: opts.type,
    fromStatus: opts.fromStatus ?? null,
    toStatus: opts.toStatus ?? null,
    message: opts.message,
    actorUserId: opts.actorUserId ?? null,
  });
}

/**
 * Apply a status change with validation + audit event. Returns false if the
 * transition isn't allowed from the current state.
 */
export async function transitionOrder(opts: {
  orderId: string;
  to: OrderDbStatus;
  message?: string;
  actorUserId?: string | null;
}): Promise<boolean> {
  const order = await db.query.orders.findFirst({
    where: eq(orders.id, opts.orderId),
    columns: { id: true, status: true },
  });
  if (!order) return false;
  if (order.status === opts.to) return true; // idempotent
  if (!canTransition(order.status, opts.to)) return false;

  await db
    .update(orders)
    .set({ status: opts.to, updatedAt: new Date() })
    .where(eq(orders.id, opts.orderId));

  await recordEvent({
    orderId: opts.orderId,
    type: "status_change",
    fromStatus: order.status,
    toStatus: opts.to,
    message: opts.message ?? `Status changed to ${opts.to}`,
    actorUserId: opts.actorUserId,
  });

  // Customer notifications on key fulfilment milestones.
  if (opts.to === "shipped") await sendShippingUpdate(opts.orderId);
  else if (opts.to === "delivered") await sendDeliveredUpdate(opts.orderId);
  else if (opts.to === "cancelled") await sendOrderCancelled(opts.orderId);
  return true;
}

// --- Payment capture (idempotent; shared by verify + webhook) ---------------

async function decrementStockForOrder(orderId: string) {
  const items = await db.query.orderItems.findMany({
    where: eq(orderItems.orderId, orderId),
  });
  for (const item of items) {
    if (!item.variantSku) continue;
    await db
      .update(productVariants)
      .set({ stock: sql`greatest(0, ${productVariants.stock} - ${item.quantity})` })
      .where(eq(productVariants.sku, item.variantSku));
  }
}

/**
 * Mark an order paid exactly once. Safe to call from both the browser verify
 * callback and the Razorpay webhook (whichever lands first wins).
 */
export async function markOrderPaid(opts: {
  orderId: string;
  providerPaymentId?: string;
  method?: string;
  raw?: unknown;
}): Promise<void> {
  const order = await db.query.orders.findFirst({
    where: eq(orders.id, opts.orderId),
    columns: { id: true, status: true, total: true },
  });
  if (!order) return;

  // Already advanced past pending → nothing to do (idempotent).
  if (order.status !== "pending" && order.status !== "payment_failed") {
    // Still backfill the provider payment id if the webhook has more detail.
    if (opts.providerPaymentId) {
      await db
        .update(payments)
        .set({
          providerPaymentId: opts.providerPaymentId,
          status: "captured",
          method: opts.method,
          updatedAt: new Date(),
        })
        .where(eq(payments.orderId, opts.orderId));
    }
    return;
  }

  await db
    .update(orders)
    .set({ status: "paid", updatedAt: new Date() })
    .where(eq(orders.id, opts.orderId));

  const existingPayment = await db.query.payments.findFirst({
    where: eq(payments.orderId, opts.orderId),
  });
  if (existingPayment) {
    await db
      .update(payments)
      .set({
        providerPaymentId: opts.providerPaymentId ?? existingPayment.providerPaymentId,
        status: "captured",
        method: opts.method ?? existingPayment.method,
        raw: opts.raw ?? existingPayment.raw,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, existingPayment.id));
  } else {
    await db.insert(payments).values({
      id: `pay-${opts.orderId}`,
      orderId: opts.orderId,
      provider: opts.providerPaymentId ? "razorpay" : "demo",
      providerPaymentId: opts.providerPaymentId ?? null,
      amount: order.total,
      status: "captured",
      method: opts.method ?? null,
      raw: (opts.raw as object) ?? null,
    });
  }

  await decrementStockForOrder(opts.orderId);

  await recordEvent({
    orderId: opts.orderId,
    type: "status_change",
    fromStatus: order.status,
    toStatus: "paid",
    message: "Payment captured",
  });

  // Order confirmation email (no-op when Resend isn't configured; idempotent).
  await sendOrderConfirmation(opts.orderId);
}

export async function findOrderByNumber(orderNumber: string) {
  return db.query.orders.findFirst({
    where: eq(orders.number, orderNumber),
    with: {
      items: true,
      events: { orderBy: [desc(orderEvents.createdAt)] },
    },
  });
}

export async function markPaymentFailed(orderId: string) {
  const ok = await transitionOrder({
    orderId,
    to: "payment_failed",
    message: "Payment failed or was abandoned",
  });
  if (ok) await sendPaymentFailed(orderId);
}

// Re-export so the variant lookup in the create action can share the and/eq.
export { and, eq };
