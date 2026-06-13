import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { payments } from "@/lib/db/schema";
import { markOrderPaid, markPaymentFailed } from "@/lib/orders";
import { verifyWebhookSignature } from "@/lib/razorpay";

/**
 * Razorpay webhook — the source of truth for payment state. Configure the
 * endpoint in the Razorpay dashboard for events:
 *   payment.captured, payment.failed
 */
export async function POST(request: NextRequest) {
  const raw = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";

  if (!verifyWebhookSignature(raw, signature)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const event = JSON.parse(raw);
  const entity = event?.payload?.payment?.entity;
  const razorpayOrderId: string | undefined = entity?.order_id;
  if (!razorpayOrderId) return NextResponse.json({ ok: true });

  const payment = await db.query.payments.findFirst({
    where: eq(payments.providerOrderId, razorpayOrderId),
    columns: { orderId: true },
  });
  if (!payment) return NextResponse.json({ ok: true });

  if (event.event === "payment.captured") {
    await markOrderPaid({
      orderId: payment.orderId,
      providerPaymentId: entity.id,
      method: entity.method,
      raw: entity,
    });
  } else if (event.event === "payment.failed") {
    await markPaymentFailed(payment.orderId);
  }

  return NextResponse.json({ ok: true });
}
