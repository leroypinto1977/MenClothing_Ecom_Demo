"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SiteButton } from "@/components/site-button";
import { CartLineItem } from "@/components/cart/cart-line-item";
import { useCart } from "@/lib/store/cart-context";
import { formatPrice } from "@/lib/format";

const FREE_SHIPPING = 12000;

export function CartDrawer() {
  const { items, subtotal, count, isCartOpen, setCartOpen, closeCart } = useCart();
  const remaining = Math.max(0, FREE_SHIPPING - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING) * 100);

  return (
    <Sheet open={isCartOpen} onOpenChange={setCartOpen}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-5 py-4">
          <SheetTitle className="text-sm font-semibold uppercase tracking-[0.2em]">
            Your Bag {count > 0 && <span className="text-muted-foreground">({count})</span>}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <ShoppingBag className="size-10 text-muted-foreground/50" strokeWidth={1} />
            <div>
              <p className="font-serif text-lg">Your bag is empty</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Considered pieces, made to last. Start with the essentials.
              </p>
            </div>
            <SiteButton href="/shop" size="md" onClick={closeCart}>
              Shop now
            </SiteButton>
          </div>
        ) : (
          <>
            {/* Free shipping progress */}
            <div className="border-b border-border px-5 py-3">
              {remaining > 0 ? (
                <p className="text-xs text-muted-foreground">
                  You&apos;re{" "}
                  <span className="font-medium text-foreground">
                    {formatPrice(remaining)}
                  </span>{" "}
                  away from complimentary shipping
                </p>
              ) : (
                <p className="text-xs text-foreground">
                  ✓ You&apos;ve unlocked complimentary shipping
                </p>
              )}
              <div className="mt-2 h-1 w-full overflow-hidden bg-secondary">
                <div
                  className="h-full bg-brand transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
              {items.map((item) => (
                <CartLineItem key={item.key} item={item} onNavigate={closeCart} />
              ))}
            </div>

            <div className="space-y-4 border-t border-border px-5 py-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium tabular-nums">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Shipping & taxes calculated at checkout.
              </p>
              <SiteButton href="/checkout" size="block" onClick={closeCart}>
                Checkout
              </SiteButton>
              <Link
                href="/cart"
                onClick={closeCart}
                className="block text-center text-xs uppercase tracking-[0.15em] text-foreground/70 underline-offset-4 hover:text-foreground hover:underline"
              >
                View full bag
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
