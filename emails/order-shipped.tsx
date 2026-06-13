import * as React from "react";
import { Section, Text } from "@react-email/components";
import {
  EmailLayout,
  Eyebrow,
  H1,
  Paragraph,
  PrimaryButton,
  OrderBadge,
  OrderSummary,
  AddressBlock,
  Divider,
  C,
} from "./_components";
import { siteUrl, type EmailOrder } from "@/lib/email-types";

export const subject = (o: EmailOrder) => `Your order has shipped — ${o.number}`;

export default function OrderShippedEmail({ order }: { order: EmailOrder }) {
  const name = order.customerName?.split(" ")[0];
  const trackHref = order.trackingUrl || `${siteUrl()}/account`;
  return (
    <EmailLayout preview={`Your MERIDIAN order ${order.number} is on its way`}>
      <Eyebrow>On its way</Eyebrow>
      <H1>{name ? `It's shipped, ${name}.` : "Your order has shipped."}</H1>
      <Paragraph>Good news — your order is on its way to you.</Paragraph>

      {order.trackingNumber ? (
        <Section
          style={{
            backgroundColor: C.brandSoft,
            borderRadius: 4,
            padding: "16px 18px",
            marginBottom: 20,
          }}
        >
          <Text style={{ margin: 0, fontSize: 13, color: C.muted }}>
            Carrier
            <span style={{ color: C.ink, fontWeight: 600, marginLeft: 6 }}>
              {order.carrier ?? "—"}
            </span>
          </Text>
          <Text style={{ margin: "4px 0 0", fontSize: 13, color: C.muted }}>
            Tracking
            <span style={{ color: C.ink, fontWeight: 600, marginLeft: 6 }}>
              {order.trackingNumber}
            </span>
          </Text>
        </Section>
      ) : null}

      <PrimaryButton href={trackHref}>Track your parcel</PrimaryButton>
      <OrderBadge number={order.number} />
      <OrderSummary order={order} />
      <AddressBlock order={order} />
      <Divider />
      <Paragraph>Most orders arrive within 2–4 business days.</Paragraph>
    </EmailLayout>
  );
}

OrderShippedEmail.PreviewProps = {
  order: {
    number: "MER-11049",
    email: "you@example.com",
    customerName: "James Whitfield",
    subtotal: 15200,
    shipping: 0,
    tax: 1216,
    total: 16416,
    carrier: "Blue Dart",
    trackingNumber: "BD-2026-5599",
    trackingUrl: "https://www.bluedart.com/tracking",
    shippingAddress: {
      name: "James Whitfield",
      line1: "14 Pali Hill Road",
      city: "Mumbai",
      region: "Maharashtra",
      postal: "400050",
      country: "India",
    },
    items: [
      {
        name: "The Garment-Dyed Oxford",
        color: "Navy",
        size: "M",
        quantity: 1,
        unitPrice: 10200,
        image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=120",
      },
    ],
  },
} satisfies { order: EmailOrder };
