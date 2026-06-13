"use server";

import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  orderItems,
  orders,
  payments,
  productVariants,
  refunds,
  type OrderDbStatus,
} from "@/lib/db/schema";
import { requireAdmin, requireAdminArea } from "@/lib/admin/guard";
import { recordEvent, transitionOrder } from "@/lib/orders";
import { createRazorpayRefund, razorpayEnabled } from "@/lib/razorpay";

function revalidateOrder(id: string) {
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin");
}

/** Advance fulfilment state (processing → shipped → delivered, or cancel). */
export async function advanceOrderStatus(fd: FormData) {
  const session = await requireAdminArea();
  const id = String(fd.get("id") ?? "");
  const to = String(fd.get("to") ?? "") as OrderDbStatus;
  if (!id || !to) return;

  // Cancelling a paid/processing order returns its items to stock.
  if (to === "cancelled") {
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, id),
      columns: { status: true },
    });
    if (order && ["paid", "processing"].includes(order.status)) {
      const items = await db.query.orderItems.findMany({
        where: eq(orderItems.orderId, id),
      });
      for (const item of items) {
        if (!item.variantSku) continue;
        await db
          .update(productVariants)
          .set({ stock: sql`${productVariants.stock} + ${item.quantity}` })
          .where(eq(productVariants.sku, item.variantSku));
      }
    }
  }

  await transitionOrder({
    orderId: id,
    to,
    actorUserId: session.user.id,
  });
  revalidateOrder(id);
}

/** Attach carrier + tracking and (if not already) move to shipped. */
export async function addTracking(fd: FormData) {
  const session = await requireAdminArea();
  const id = String(fd.get("id") ?? "");
  const carrier = String(fd.get("carrier") ?? "").trim();
  const trackingNumber = String(fd.get("trackingNumber") ?? "").trim();
  const trackingUrl = String(fd.get("trackingUrl") ?? "").trim();
  if (!id || !trackingNumber) return;

  await db
    .update(orders)
    .set({
      carrier: carrier || null,
      trackingNumber,
      trackingUrl: trackingUrl || null,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, id));

  await recordEvent({
    orderId: id,
    type: "tracking_added",
    message: `Tracking ${trackingNumber}${carrier ? ` via ${carrier}` : ""}`,
    actorUserId: session.user.id,
  });

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, id),
    columns: { status: true },
  });
  if (order && (order.status === "paid" || order.status === "processing")) {
    await transitionOrder({
      orderId: id,
      to: "shipped",
      message: "Shipped with tracking",
      actorUserId: session.user.id,
    });
  }
  revalidateOrder(id);
}

export async function addOrderNote(fd: FormData) {
  const session = await requireAdminArea();
  const id = String(fd.get("id") ?? "");
  const message = String(fd.get("message") ?? "").trim();
  if (!id || !message) return;
  await recordEvent({
    orderId: id,
    type: "note",
    message,
    actorUserId: session.user.id,
  });
  revalidateOrder(id);
}

/** Issue a refund (admin only). Goes through Razorpay when configured. */
export async function refundOrder(fd: FormData) {
  const session = await requireAdmin();
  const id = String(fd.get("id") ?? "");
  const reason = String(fd.get("reason") ?? "").trim() || "Refund issued";
  if (!id) return;

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, id),
    columns: { id: true, total: true, status: true },
  });
  if (!order) return;

  const payment = await db.query.payments.findFirst({
    where: eq(payments.orderId, id),
  });

  if (razorpayEnabled() && payment?.providerPaymentId) {
    try {
      const refund = await createRazorpayRefund({
        paymentId: payment.providerPaymentId,
      });
      await db.insert(refunds).values({
        id: `ref-${id}`,
        paymentId: payment.id,
        amount: order.total,
        reason,
        providerRefundId: refund.id,
      });
    } catch {
      await recordEvent({
        orderId: id,
        type: "note",
        message: "Razorpay refund failed — resolve manually in dashboard.",
        actorUserId: session.user.id,
      });
      revalidateOrder(id);
      return;
    }
  } else if (payment) {
    await db.insert(refunds).values({
      id: `ref-${id}`,
      paymentId: payment.id,
      amount: order.total,
      reason,
    });
  }

  if (payment) {
    await db
      .update(payments)
      .set({ status: "refunded", updatedAt: new Date() })
      .where(eq(payments.id, payment.id));
  }

  // Move to refund_requested first if needed, then refunded.
  if (order.status !== "refund_requested" && order.status !== "refunded") {
    await transitionOrder({
      orderId: id,
      to: "refund_requested",
      message: "Refund requested",
      actorUserId: session.user.id,
    });
  }
  await transitionOrder({
    orderId: id,
    to: "refunded",
    message: reason,
    actorUserId: session.user.id,
  });
  revalidateOrder(id);
}
