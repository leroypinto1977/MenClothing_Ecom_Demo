import { createHmac } from "node:crypto";

const KEY_ID = process.env.RAZORPAY_KEY_ID;
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

/** True when live Razorpay credentials are configured. */
export function razorpayEnabled() {
  return Boolean(KEY_ID && KEY_SECRET);
}

export function razorpayKeyId() {
  return KEY_ID ?? null;
}

interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
}

/** Create a Razorpay order. Amount is in whole rupees; converted to paise. */
export async function createRazorpayOrder(opts: {
  amountRupees: number;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<RazorpayOrder> {
  if (!KEY_ID || !KEY_SECRET) throw new Error("Razorpay is not configured");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64")}`,
    },
    body: JSON.stringify({
      amount: opts.amountRupees * 100,
      currency: "INR",
      receipt: opts.receipt,
      notes: opts.notes,
    }),
  });
  if (!res.ok) {
    throw new Error(`Razorpay order failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

/** Issue a (full or partial) refund against a captured payment. */
export async function createRazorpayRefund(opts: {
  paymentId: string;
  amountRupees?: number;
}): Promise<{ id: string }> {
  if (!KEY_ID || !KEY_SECRET) throw new Error("Razorpay is not configured");
  const res = await fetch(
    `https://api.razorpay.com/v1/payments/${opts.paymentId}/refund`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString("base64")}`,
      },
      body: JSON.stringify(
        opts.amountRupees ? { amount: opts.amountRupees * 100 } : {}
      ),
    }
  );
  if (!res.ok) {
    throw new Error(`Razorpay refund failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

/** Verify the signature returned by Razorpay Checkout to the browser. */
export function verifyPaymentSignature(opts: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  signature: string;
}): boolean {
  if (!KEY_SECRET) return false;
  const expected = createHmac("sha256", KEY_SECRET)
    .update(`${opts.razorpayOrderId}|${opts.razorpayPaymentId}`)
    .digest("hex");
  return timingSafeEqualHex(expected, opts.signature);
}

/** Verify a webhook payload against the webhook secret. */
export function verifyWebhookSignature(body: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return false;
  const expected = createHmac("sha256", secret).update(body).digest("hex");
  return timingSafeEqualHex(expected, signature);
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
