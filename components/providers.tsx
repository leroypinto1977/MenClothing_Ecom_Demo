"use client";

import { CartProvider } from "@/lib/store/cart-context";
import { WishlistProvider } from "@/lib/store/wishlist-context";
import { UIProvider } from "@/lib/store/ui-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <UIProvider>
      <WishlistProvider>
        <CartProvider>{children}</CartProvider>
      </WishlistProvider>
    </UIProvider>
  );
}
