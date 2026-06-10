import type { Metadata } from "next";
import { CartPage } from "@/components/cart/cart-page";
import { getBestsellers } from "@/lib/data";

export const metadata: Metadata = {
  title: "Shopping Bag",
};

export default function Cart() {
  return <CartPage upsell={getBestsellers(4)} />;
}
