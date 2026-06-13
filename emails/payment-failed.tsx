import * as React from "react";
import {
  EmailLayout,
  Eyebrow,
  H1,
  Paragraph,
  PrimaryButton,
  OrderBadge,
  Divider,
} from "./_components";
import { siteUrl, type EmailOrder } from "@/lib/email-types";

export const subject = (o: EmailOrder) => `Payment didn't go through — ${o.number}`;

export default function PaymentFailedEmail({ order }: { order: EmailOrder }) {
  return (
    <EmailLayout
      preview={`We couldn't process payment for order ${order.number}`}
      reason="You're receiving this because a payment attempt on your MERIDIAN order didn't complete."
    >
      <Eyebrow>Payment unsuccessful</Eyebrow>
      <H1>We couldn&apos;t process your payment.</H1>
      <Paragraph>
        Your payment for order <strong>{order.number}</strong> didn&apos;t go through,
        so we haven&apos;t been able to confirm it yet. No money has been taken — and
        your items are still reserved for a short while.
      </Paragraph>
      <Paragraph>You can complete your purchase using the link below.</Paragraph>
      <PrimaryButton href={`${siteUrl()}/cart`}>Complete your order</PrimaryButton>
      <OrderBadge number={order.number} />
      <Divider />
      <Paragraph>
        If you continue to see issues, try a different card or UPI app, or reply to
        this email and we&apos;ll help.
      </Paragraph>
    </EmailLayout>
  );
}

PaymentFailedEmail.PreviewProps = {
  order: {
    number: "MER-11049",
    email: "you@example.com",
    subtotal: 15200,
    shipping: 0,
    tax: 1216,
    total: 16416,
    shippingAddress: null,
    items: [],
  },
} satisfies { order: EmailOrder };
