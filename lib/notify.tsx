import "server-only";
import * as React from "react";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { orderEvents, orders } from "@/lib/db/schema";
import { sendEmail } from "@/lib/email";
import type { EmailOrder } from "@/lib/email-types";

import OrderConfirmationEmail, {
  subject as confirmationSubject,
} from "@/emails/order-confirmation";
import OrderShippedEmail, { subject as shippedSubject } from "@/emails/order-shipped";
import OrderDeliveredEmail, {
  subject as deliveredSubject,
} from "@/emails/order-delivered";
import OrderCancelledEmail, {
  subject as cancelledSubject,
} from "@/emails/order-cancelled";
import RefundIssuedEmail, { subject as refundSubject } from "@/emails/refund-issued";
import PaymentFailedEmail, {
  subject as paymentFailedSubject,
} from "@/emails/payment-failed";
import WelcomeEmail, { subject as welcomeSubject } from "@/emails/welcome";
import PasswordResetEmail, {
  subject as passwordResetSubject,
} from "@/emails/password-reset";
import AdminNewOrderEmail, {
  subject as adminNewOrderSubject,
} from "@/emails/admin-new-order";

type OrderEmailKind =
  | "confirmation"
  | "shipping"
  | "delivered"
  | "cancelled"
  | "refund"
  | "payment_failed"
  | "admin_new_order";

async function loadOrder(orderId: string): Promise<(EmailOrder & { id: string }) | null> {
  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: { items: true, user: { columns: { name: true } } },
  });
  if (!order) return null;
  return {
    id: order.id,
    number: order.number,
    email: order.email,
    customerName: order.user?.name ?? order.shippingAddress?.name ?? undefined,
    subtotal: order.subtotal,
    shipping: order.shipping,
    tax: order.tax,
    total: order.total,
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
      image: i.image,
    })),
  };
}

/** Guard against double-sends (e.g. verify callback + webhook both land). */
async function alreadySent(orderId: string, kind: OrderEmailKind) {
  const tag = `[${kind}]`;
  const rows = await db.query.orderEvents.findMany({
    where: and(eq(orderEvents.orderId, orderId), eq(orderEvents.type, "email_sent")),
    columns: { message: true },
  });
  return rows.some((r) => r.message?.startsWith(tag));
}

async function recordOrderEmail(
  orderId: string,
  kind: OrderEmailKind,
  to: string,
  sent: boolean
) {
  await db.insert(orderEvents).values({
    orderId,
    type: "email_sent",
    message: `[${kind}] ${sent ? "Sent" : "Queued (email disabled)"} to ${to}`,
  });
}

/** Sends a customer order email once and records it on the timeline. */
async function sendOrderEmail(
  orderId: string,
  kind: OrderEmailKind,
  build: (order: EmailOrder) => { subject: string; template: React.ReactElement }
) {
  if (await alreadySent(orderId, kind)) return;
  const order = await loadOrder(orderId);
  if (!order) return;
  const { subject, template } = build(order);
  const sent = await sendEmail({ to: order.email, subject, template });
  await recordOrderEmail(orderId, kind, order.email, sent);
}

// --- Order lifecycle --------------------------------------------------------

export async function sendOrderConfirmation(orderId: string) {
  await sendOrderEmail(orderId, "confirmation", (order) => ({
    subject: confirmationSubject(order),
    template: <OrderConfirmationEmail order={order} />,
  }));
  // Internal alert in parallel (separate idempotency tag + recipient).
  await sendAdminNewOrder(orderId);
}

export async function sendShippingUpdate(orderId: string) {
  await sendOrderEmail(orderId, "shipping", (order) => ({
    subject: shippedSubject(order),
    template: <OrderShippedEmail order={order} />,
  }));
}

export async function sendDeliveredUpdate(orderId: string) {
  await sendOrderEmail(orderId, "delivered", (order) => ({
    subject: deliveredSubject(order),
    template: <OrderDeliveredEmail order={order} />,
  }));
}

export async function sendOrderCancelled(orderId: string) {
  await sendOrderEmail(orderId, "cancelled", (order) => ({
    subject: cancelledSubject(order),
    template: <OrderCancelledEmail order={order} />,
  }));
}

export async function sendRefundIssued(
  orderId: string,
  refundAmount: number,
  refundReason?: string
) {
  if (await alreadySent(orderId, "refund")) return;
  const order = await loadOrder(orderId);
  if (!order) return;
  const withRefund = { ...order, refundAmount, refundReason };
  const sent = await sendEmail({
    to: order.email,
    subject: refundSubject(withRefund),
    template: <RefundIssuedEmail order={withRefund} />,
  });
  await recordOrderEmail(orderId, "refund", order.email, sent);
}

export async function sendPaymentFailed(orderId: string) {
  await sendOrderEmail(orderId, "payment_failed", (order) => ({
    subject: paymentFailedSubject(order),
    template: <PaymentFailedEmail order={order} />,
  }));
}

async function sendAdminNewOrder(orderId: string) {
  const to = process.env.ADMIN_ORDER_EMAIL;
  if (!to) return; // internal alerts are opt-in
  if (await alreadySent(orderId, "admin_new_order")) return;
  const order = await loadOrder(orderId);
  if (!order) return;
  const sent = await sendEmail({
    to,
    subject: adminNewOrderSubject(order),
    template: <AdminNewOrderEmail order={order} orderId={orderId} />,
  });
  await recordOrderEmail(orderId, "admin_new_order", to, sent);
}

// --- Account ----------------------------------------------------------------

export async function sendWelcome(email: string, name?: string) {
  await sendEmail({
    to: email,
    subject: welcomeSubject(),
    template: <WelcomeEmail name={name} />,
  });
}

export async function sendPasswordReset(email: string, url: string, name?: string) {
  await sendEmail({
    to: email,
    subject: passwordResetSubject(),
    template: <PasswordResetEmail url={url} name={name} />,
  });
}
