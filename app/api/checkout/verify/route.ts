import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders, payments } from "@/lib/db/schema";
import { markOrderPaid, markPaymentFailed } from "@/lib/orders";
import { razorpayEnabled, verifyPaymentSignature } from "@/lib/razorpay";

/**
 * Browser callback after Razorpay Checkout. Verifies the signature and marks
 * the order paid. Idempotent with the webhook. In demo mode (no gateway), the
 * `demo` flag captures the order directly.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.orderNumber)
    return NextResponse.json({ ok: false }, { status: 400 });

  const order = await db.query.orders.findFirst({
    where: eq(orders.number, String(body.orderNumber)),
    columns: { id: true },
  });
  if (!order) return NextResponse.json({ ok: false }, { status: 404 });

  // Demo path — only allowed when no gateway is configured.
  if (body.demo === true && !razorpayEnabled()) {
    await markOrderPaid({ orderId: order.id, method: "demo" });
    return NextResponse.json({ ok: true });
  }

  const valid = verifyPaymentSignature({
    razorpayOrderId: String(body.razorpay_order_id ?? ""),
    razorpayPaymentId: String(body.razorpay_payment_id ?? ""),
    signature: String(body.razorpay_signature ?? ""),
  });

  // Confirm the signed order id matches the payment row for this order.
  const payment = await db.query.payments.findFirst({
    where: eq(payments.orderId, order.id),
    columns: { providerOrderId: true },
  });

  if (!valid || payment?.providerOrderId !== body.razorpay_order_id) {
    await markPaymentFailed(order.id);
    return NextResponse.json({ ok: false, error: "verification_failed" }, { status: 400 });
  }

  await markOrderPaid({
    orderId: order.id,
    providerPaymentId: String(body.razorpay_payment_id),
    method: "razorpay",
  });
  return NextResponse.json({ ok: true });
}
