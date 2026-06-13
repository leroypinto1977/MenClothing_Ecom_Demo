"use server";

import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  orderItems,
  orders,
  payments,
  products,
  productVariants,
  type AddressSnapshot,
} from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { computeTotals } from "@/lib/cart-totals";
import { nextOrderNumber, recordEvent, signOrderToken } from "@/lib/orders";
import {
  createRazorpayOrder,
  razorpayEnabled,
  razorpayKeyId,
} from "@/lib/razorpay";

export interface CheckoutItemInput {
  productId: string;
  color: string;
  size: string;
  quantity: number;
}

export interface CheckoutInput {
  email: string;
  items: CheckoutItemInput[];
  deliveryMethod: "standard" | "express" | "collect";
  shipping: {
    firstName: string;
    lastName: string;
    line1: string;
    line2?: string;
    city: string;
    postal: string;
    country: string;
    phone?: string;
  };
}

export type CreateOrderResult =
  | {
      ok: true;
      orderNumber: string;
      token: string;
      amount: number;
      demo: boolean;
      razorpay?: { keyId: string; orderId: string; amount: number };
    }
  | { ok: false; error: string };

function deliveryPrice(
  method: CheckoutInput["deliveryMethod"],
  baseShipping: number
) {
  if (method === "express") return 1200;
  if (method === "collect") return 0;
  return baseShipping;
}

export async function createOrder(
  input: CheckoutInput
): Promise<CreateOrderResult> {
  if (!input.items?.length) return { ok: false, error: "Your bag is empty." };
  if (!input.email?.includes("@"))
    return { ok: false, error: "A valid email is required." };

  const session = await auth.api.getSession({ headers: await headers() });

  // Validate every line against the DB — never trust client prices or stock.
  const lineItems: {
    productId: string;
    sku: string;
    name: string;
    image: string;
    color: string;
    size: string;
    quantity: number;
    unitPrice: number;
  }[] = [];
  let subtotal = 0;

  for (const item of input.items) {
    if (!item.quantity || item.quantity < 1)
      return { ok: false, error: "Invalid quantity." };

    const product = await db.query.products.findFirst({
      where: and(eq(products.id, item.productId), eq(products.status, "active")),
      with: { images: true },
    });
    if (!product)
      return { ok: false, error: "A product in your bag is no longer available." };

    const variant = await db.query.productVariants.findFirst({
      where: and(
        eq(productVariants.productId, item.productId),
        eq(productVariants.color, item.color),
        eq(productVariants.size, item.size)
      ),
    });
    if (!variant)
      return {
        ok: false,
        error: `${product.name} (${item.color}/${item.size}) is unavailable.`,
      };
    if (variant.stock < item.quantity)
      return {
        ok: false,
        error: `Only ${variant.stock} left of ${product.name} (${item.color}/${item.size}).`,
      };

    const unitPrice = variant.priceOverride ?? product.price;
    subtotal += unitPrice * item.quantity;
    lineItems.push({
      productId: product.id,
      sku: variant.sku,
      name: product.name,
      image: product.images[0]?.thumb ?? "",
      color: item.color,
      size: item.size,
      quantity: item.quantity,
      unitPrice,
    });
  }

  const base = computeTotals(subtotal);
  const shipping = deliveryPrice(input.deliveryMethod, base.shipping);
  const total = base.subtotal + base.tax + shipping;

  const orderNumber = await nextOrderNumber();
  const orderId = `ord-${orderNumber.toLowerCase()}`;

  const address: AddressSnapshot = {
    name: `${input.shipping.firstName} ${input.shipping.lastName}`.trim(),
    line1: input.shipping.line1,
    line2: input.shipping.line2,
    city: input.shipping.city,
    region: "",
    postal: input.shipping.postal,
    country: input.shipping.country,
    phone: input.shipping.phone,
  };

  await db.insert(orders).values({
    id: orderId,
    number: orderNumber,
    userId: session?.user.id ?? null,
    email: input.email,
    status: "pending",
    subtotal: base.subtotal,
    shipping,
    tax: base.tax,
    total,
    shippingAddress: address,
    deliveryMethod: input.deliveryMethod,
  });

  await db.insert(orderItems).values(
    lineItems.map((li) => ({
      orderId,
      productId: li.productId,
      variantSku: li.sku,
      name: li.name,
      image: li.image,
      color: li.color,
      size: li.size,
      quantity: li.quantity,
      unitPrice: li.unitPrice,
    }))
  );

  await recordEvent({
    orderId,
    type: "status_change",
    toStatus: "pending",
    message: "Order placed",
    actorUserId: session?.user.id ?? null,
  });

  const token = signOrderToken(orderNumber);

  if (razorpayEnabled()) {
    try {
      const rp = await createRazorpayOrder({
        amountRupees: total,
        receipt: orderNumber,
        notes: { orderId, orderNumber },
      });
      await db.insert(payments).values({
        id: `pay-${orderId}`,
        orderId,
        provider: "razorpay",
        providerOrderId: rp.id,
        amount: total,
        status: "created",
      });
      return {
        ok: true,
        orderNumber,
        token,
        amount: total,
        demo: false,
        razorpay: { keyId: razorpayKeyId()!, orderId: rp.id, amount: total },
      };
    } catch {
      return {
        ok: false,
        error: "Could not reach the payment gateway. Please try again.",
      };
    }
  }

  // Demo mode: no gateway configured — payment is captured client-side.
  return { ok: true, orderNumber, token, amount: total, demo: true };
}
