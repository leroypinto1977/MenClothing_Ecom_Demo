"use client";

import Link from "next/link";
import { ShoppingBag, ArrowLeft, Lock } from "lucide-react";
import { Container } from "@/components/container";
import { SiteButton } from "@/components/site-button";
import { CartLineItem } from "@/components/cart/cart-line-item";
import { OrderSummary } from "@/components/cart/order-summary";
import { SectionHeading } from "@/components/section-heading";
import { ProductGrid } from "@/components/product/product-grid";
import { useCart } from "@/lib/store/cart-context";
import type { Product } from "@/lib/types";

export function CartPage({ upsell }: { upsell: Product[] }) {
  const { items, count, hydrated } = useCart();

  if (hydrated && items.length === 0) {
    return (
      <Container className="flex flex-col items-center justify-center gap-5 py-28 text-center">
        <ShoppingBag className="size-12 text-muted-foreground/40" strokeWidth={1} />
        <div>
          <h1 className="font-serif text-3xl">Your bag is empty</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Once you add something, it will appear here.
          </p>
        </div>
        <SiteButton href="/shop" size="lg">
          Start shopping
        </SiteButton>
      </Container>
    );
  }

  return (
    <Container className="py-10 md:py-14">
      <h1 className="font-serif text-3xl tracking-tight md:text-4xl">
        Shopping Bag
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {hydrated ? `${count} item${count === 1 ? "" : "s"}` : " "}
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-14">
        {/* Items */}
        <div>
          <div className="divide-y divide-border border-y border-border">
            {items.map((item) => (
              <CartLineItem key={item.key} item={item} className="py-6" />
            ))}
          </div>
          <Link
            href="/shop"
            className="mt-6 inline-flex items-center gap-2 text-sm text-foreground/80 hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Continue shopping
          </Link>
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <OrderSummary>
            <SiteButton href="/checkout" size="block">
              <Lock className="size-4" />
              Secure checkout
            </SiteButton>
            <div className="mt-4 flex items-center justify-center gap-1.5 opacity-70">
              {["VISA", "MC", "AMEX", "PAY"].map((p) => (
                <span
                  key={p}
                  className="rounded-sm border border-border px-1.5 py-0.5 text-[0.6rem] font-medium tracking-wider"
                >
                  {p}
                </span>
              ))}
            </div>
          </OrderSummary>
        </div>
      </div>

      {upsell.length > 0 && (
        <section className="mt-20">
          <SectionHeading eyebrow="Add to your order" title="You may also like" />
          <ProductGrid products={upsell} className="mt-8" />
        </section>
      )}
    </Container>
  );
}
