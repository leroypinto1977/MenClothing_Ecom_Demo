import * as React from "react";
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
} from "./_components";
import { siteUrl, type EmailOrder } from "@/lib/email-types";

export const subject = (o: EmailOrder) => `Order confirmed — ${o.number}`;

export default function OrderConfirmationEmail({ order }: { order: EmailOrder }) {
  const name = order.customerName?.split(" ")[0];
  return (
    <EmailLayout preview={`Your MERIDIAN order ${order.number} is confirmed`}>
      <Eyebrow>Order confirmed</Eyebrow>
      <H1>{name ? `Thank you, ${name}.` : "Thank you for your order."}</H1>
      <Paragraph>
        We&apos;ve received your order and payment. We&apos;re preparing it now and
        will email you again the moment it ships.
      </Paragraph>
      <OrderBadge number={order.number} />
      <OrderSummary order={order} />
      <AddressBlock order={order} />
      <Divider />
      <PrimaryButton href={`${siteUrl()}/account`}>View your order</PrimaryButton>
    </EmailLayout>
  );
}

OrderConfirmationEmail.PreviewProps = {
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
        unitPrice: 10200,
        image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?w=120",
      },
      {
        name: "Bridle Leather Belt",
        color: "Tan",
        size: "One Size",
        quantity: 1,
        unitPrice: 5000,
        image: "https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=120",
      },
    ],
  },
} satisfies { order: EmailOrder };
