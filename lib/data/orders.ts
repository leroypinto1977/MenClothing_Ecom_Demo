import type { Order, OrderItem } from "@/lib/types";
import { getProductById } from "./products";

function item(
  productId: string,
  color: string,
  size: string,
  quantity: number
): OrderItem {
  const p = getProductById(productId)!;
  return {
    productId,
    name: p.name,
    image: p.images[0].thumb,
    color,
    size,
    quantity,
    price: p.price,
  };
}

function totals(items: OrderItem[], shipping: number) {
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  return { subtotal, shipping, total: subtotal + shipping };
}

const o1Items = [
  item("outerwear-1", "Camel", "M", 1),
  item("knitwear-1", "Navy", "M", 1),
];
const o2Items = [
  item("shirts-1", "Optic White", "M", 2),
  item("trousers-2", "Sand", "32", 1),
  item("accessories-4", "Charcoal", "One Size", 1),
];
const o3Items = [item("tees-1", "Ink", "M", 3)];

export const orders: Order[] = [
  {
    id: "MER-10428",
    date: "2026-05-18",
    status: "Delivered",
    items: o1Items,
    ...totals(o1Items, 0),
    tracking: "RM-4827-1192-UK",
  },
  {
    id: "MER-10391",
    date: "2026-04-26",
    status: "In transit",
    items: o2Items,
    ...totals(o2Items, 0),
    tracking: "RM-4810-7741-UK",
  },
  {
    id: "MER-10355",
    date: "2026-03-30",
    status: "Delivered",
    items: o3Items,
    ...totals(o3Items, 600),
    tracking: "RM-4795-3320-UK",
  },
];

export function getOrder(id: string): Order | undefined {
  return orders.find((o) => o.id === id);
}
