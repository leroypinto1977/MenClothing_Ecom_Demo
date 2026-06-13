import * as React from "react";
import { Section, Text } from "@react-email/components";
import {
  EmailLayout,
  Eyebrow,
  H1,
  Paragraph,
  PrimaryButton,
  OrderBadge,
  Divider,
  formatINR,
  C,
} from "./_components";
import { siteUrl, type EmailOrder } from "@/lib/email-types";

export const subject = (o: EmailOrder) => `Refund issued — ${o.number}`;

export default function RefundIssuedEmail({ order }: { order: EmailOrder }) {
  const amount = order.refundAmount ?? order.total;
  return (
    <EmailLayout
      preview={`A refund of ${formatINR(amount)} has been issued for ${order.number}`}
      reason="You're receiving this because a refund was issued on your MERIDIAN order."
    >
      <Eyebrow>Refund issued</Eyebrow>
      <H1>Your refund is on its way.</H1>
      <Paragraph>
        We&apos;ve issued a refund for order <strong>{order.number}</strong>. It will
        appear on your original payment method within 5–7 business days, depending
        on your bank.
      </Paragraph>

      <Section
        style={{
          backgroundColor: C.brandSoft,
          borderRadius: 4,
          padding: "18px 20px",
          marginBottom: 20,
          textAlign: "center",
        }}
      >
        <Text style={{ margin: 0, fontSize: 12, color: C.muted, letterSpacing: "0.1em" }}>
          REFUND AMOUNT
        </Text>
        <Text style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 700, color: C.ink }}>
          {formatINR(amount)}
        </Text>
      </Section>

      {order.refundReason ? (
        <Paragraph>Reason: {order.refundReason}</Paragraph>
      ) : null}

      <OrderBadge number={order.number} />
      <Divider />
      <PrimaryButton href={`${siteUrl()}/account`}>View order</PrimaryButton>
    </EmailLayout>
  );
}

RefundIssuedEmail.PreviewProps = {
  order: {
    number: "MER-11049",
    email: "you@example.com",
    subtotal: 15200,
    shipping: 0,
    tax: 1216,
    total: 16416,
    refundAmount: 16416,
    refundReason: "Customer return",
    shippingAddress: null,
    items: [],
  },
} satisfies { order: EmailOrder };
