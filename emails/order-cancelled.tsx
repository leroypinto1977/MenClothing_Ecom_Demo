import * as React from "react";
import {
  EmailLayout,
  Eyebrow,
  H1,
  Paragraph,
  PrimaryButton,
  OrderBadge,
  OrderSummary,
  Divider,
} from "./_components";
import { siteUrl, type EmailOrder } from "@/lib/email-types";

export const subject = (o: EmailOrder) => `Order cancelled — ${o.number}`;

export default function OrderCancelledEmail({ order }: { order: EmailOrder }) {
  return (
    <EmailLayout
      preview={`Your MERIDIAN order ${order.number} has been cancelled`}
      reason="You're receiving this because an order on your MERIDIAN account was cancelled."
    >
      <Eyebrow>Order cancelled</Eyebrow>
      <H1>Your order has been cancelled.</H1>
      <Paragraph>
        Order <strong>{order.number}</strong> has been cancelled. If it was paid,
        any amount captured is being refunded to your original payment method and
        will appear within 5–7 business days.
      </Paragraph>
      <OrderBadge number={order.number} />
      <OrderSummary order={order} />
      <Divider />
      <Paragraph>Changed your mind by accident? You can reorder anytime.</Paragraph>
      <PrimaryButton href={`${siteUrl()}/shop`}>Continue shopping</PrimaryButton>
    </EmailLayout>
  );
}

OrderCancelledEmail.PreviewProps = {
  order: {
    number: "MER-11049",
    email: "you@example.com",
    subtotal: 15200,
    shipping: 0,
    tax: 1216,
    total: 16416,
    shippingAddress: null,
    items: [
      {
        name: "The Garment-Dyed Oxford",
        color: "Navy",
        size: "M",
        quantity: 1,
        unitPrice: 15200,
        image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=120",
      },
    ],
  },
} satisfies { order: EmailOrder };
