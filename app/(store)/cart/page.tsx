import type { Metadata } from "next";
import { CartPage } from "@/components/cart/cart-page";
import { getBestsellers } from "@/lib/db/queries";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Shopping Bag",
};

export default async function Cart() {
  return <CartPage upsell={await getBestsellers(4)} />;
}
