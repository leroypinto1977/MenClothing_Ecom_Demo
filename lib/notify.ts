import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { orderEvents, orders } from "@/lib/db/schema";
import { sendEmail } from "@/lib/email";
import {
  orderConfirmationEmail,
  shippingUpdateEmail,
} from "@/lib/email-templates";

type EmailKind = "confirmation" | "shipping";

async function loadOrder(orderId: string) {
  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: { items: true },
  });
  if (!order) return null;
  return {
    number: order.number,
    email: order.email,
    total: order.total,
    subtotal: order.subtotal,
    shipping: order.shipping,
    tax: order.tax,
    shippingAddress: order.shippingAddress,
    carrier: order.carrier,
    trackingNumber: order.trackingNumber,
    trackingUrl: order.trackingUrl,
    items: order.items.map((i) => ({
      name: i.name,
      color: i.color,
      size: i.size,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    })),
  };
}

/** Guard against double-sends (e.g. verify callback + webhook both land). */
async function alreadySent(orderId: string, kind: EmailKind) {
  const tag = `[${kind}]`;
  const rows = await db.query.orderEvents.findMany({
    where: and(eq(orderEvents.orderId, orderId), eq(orderEvents.type, "email_sent")),
    columns: { message: true },
  });
  return rows.some((r) => r.message?.startsWith(tag));
}

async function record(orderId: string, kind: EmailKind, to: string, sent: boolean) {
  await db.insert(orderEvents).values({
    orderId,
    type: "email_sent",
    message: `[${kind}] ${sent ? "Sent" : "Queued (email disabled)"} to ${to}`,
  });
}

export async function sendOrderConfirmation(orderId: string) {
  if (await alreadySent(orderId, "confirmation")) return;
  const order = await loadOrder(orderId);
  if (!order) return;
  const { subject, html } = orderConfirmationEmail(order);
  const sent = await sendEmail({ to: order.email, subject, html });
  await record(orderId, "confirmation", order.email, sent);
}

export async function sendShippingUpdate(orderId: string) {
  if (await alreadySent(orderId, "shipping")) return;
  const order = await loadOrder(orderId);
  if (!order) return;
  const { subject, html } = shippingUpdateEmail(order);
  const sent = await sendEmail({ to: order.email, subject, html });
  await record(orderId, "shipping", order.email, sent);
}
