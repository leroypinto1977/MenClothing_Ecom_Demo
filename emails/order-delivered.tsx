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

export const subject = (o: EmailOrder) => `Delivered — ${o.number}`;

export default function OrderDeliveredEmail({ order }: { order: EmailOrder }) {
  const name = order.customerName?.split(" ")[0];
  return (
    <EmailLayout preview={`Your MERIDIAN order ${order.number} has been delivered`}>
      <Eyebrow>Delivered</Eyebrow>
      <H1>{name ? `Enjoy it, ${name}.` : "Your order has arrived."}</H1>
      <Paragraph>
        Your order <strong>{order.number}</strong> has been delivered. We hope it
        lives up to the wait — built to be worn, washed, and worn again.
      </Paragraph>
      <OrderBadge number={order.number} />
      <Divider />
      <Paragraph>
        Something not right? You have 30 days to return or exchange, free of charge.
      </Paragraph>
      <PrimaryButton href={`${siteUrl()}/account`}>View order &amp; returns</PrimaryButton>
    </EmailLayout>
  );
}

OrderDeliveredEmail.PreviewProps = {
  order: {
    number: "MER-11049",
    email: "you@example.com",
    customerName: "James Whitfield",
    subtotal: 15200,
    shipping: 0,
    tax: 1216,
    total: 16416,
    shippingAddress: null,
    items: [],
  },
} satisfies { order: EmailOrder };
