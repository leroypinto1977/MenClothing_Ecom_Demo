import * as React from "react";
import { Section, Text } from "@react-email/components";
import {
  EmailLayout,
  Eyebrow,
  H1,
  PrimaryButton,
  OrderSummary,
  AddressBlock,
  Divider,
  formatINR,
  C,
} from "./_components";
import { siteUrl, type EmailOrder } from "@/lib/email-types";

export const subject = (o: EmailOrder) => `New order ${o.number} · ${formatINR(o.total)}`;

export default function AdminNewOrderEmail({
  order,
  orderId,
}: {
  order: EmailOrder;
  orderId: string;
}) {
  return (
    <EmailLayout
      preview={`New order ${order.number} for ${formatINR(order.total)}`}
      reason="You're receiving this as a MERIDIAN team member."
    >
      <Eyebrow>New order</Eyebrow>
      <H1>{order.number}</H1>
      <Section
        style={{
          backgroundColor: C.brandSoft,
          borderRadius: 4,
          padding: "14px 18px",
          marginBottom: 18,
        }}
      >
        <Text style={{ margin: 0, fontSize: 13, color: C.muted }}>
          Customer
          <span style={{ color: C.ink, fontWeight: 600, marginLeft: 6 }}>
            {order.customerName ?? order.email}
          </span>
        </Text>
        <Text style={{ margin: "4px 0 0", fontSize: 13, color: C.muted }}>
          {order.email}
        </Text>
      </Section>
      <OrderSummary order={order} />
      <AddressBlock order={order} />
      <Divider />
      <PrimaryButton href={`${siteUrl()}/admin/orders/${orderId}`}>
        Open in admin
      </PrimaryButton>
    </EmailLayout>
  );
}

AdminNewOrderEmail.PreviewProps = {
  orderId: "ord-mer-11049",
  order: {
    number: "MER-11049",
    email: "you@example.com",
    customerName: "James Whitfield",
    subtotal: 15200,
    shipping: 0,
    tax: 1216,
    total: 16416,
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
        unitPrice: 15200,
        image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=120",
      },
    ],
  },
} satisfies { order: EmailOrder; orderId: string };
