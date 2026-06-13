import type { Metadata } from "next";
import { ConfirmationView } from "@/components/checkout/confirmation-view";
import { findOrderByNumber, verifyOrderToken } from "@/lib/orders";

export const metadata: Metadata = {
  title: "Order Confirmed",
};

export default async function OrderConfirmation({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; t?: string }>;
}) {
  const { order: orderNumber, t } = await searchParams;

  if (!orderNumber || !t || !verifyOrderToken(orderNumber, t)) {
    return <ConfirmationView order={null} />;
  }

  const order = await findOrderByNumber(orderNumber);
  if (!order) return <ConfirmationView order={null} />;

  return (
    <ConfirmationView
      order={{
        number: order.number,
        email: order.email,
        status: order.status,
        deliveryMethod: order.deliveryMethod,
        items: order.items.map((i) => ({
          key: String(i.id),
          name: i.name,
          image: i.image,
          color: i.color,
          size: i.size,
          quantity: i.quantity,
          price: i.unitPrice,
        })),
        totals: {
          subtotal: order.subtotal,
          shipping: order.shipping,
          tax: order.tax,
          total: order.total,
        },
      }}
    />
  );
}
