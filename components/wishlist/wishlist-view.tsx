"use client";

import { Heart } from "lucide-react";
import { Container } from "@/components/container";
import { SiteButton } from "@/components/site-button";
import { ProductGrid } from "@/components/product/product-grid";
import { useWishlist } from "@/lib/store/wishlist-context";
import { getProductById } from "@/lib/data";
import type { Product } from "@/lib/types";

export function WishlistView() {
  const { ids, hydrated, count } = useWishlist();
  const items = ids
    .map((id) => getProductById(id))
    .filter((p): p is Product => Boolean(p));

  if (hydrated && items.length === 0) {
    return (
      <Container className="flex flex-col items-center justify-center gap-5 py-28 text-center">
        <Heart className="size-12 text-muted-foreground/40" strokeWidth={1} />
        <div>
          <h1 className="font-serif text-3xl">Your wishlist is empty</h1>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Tap the heart on any piece to save it here for later.
          </p>
        </div>
        <SiteButton href="/shop" size="lg">
          Explore the collection
        </SiteButton>
      </Container>
    );
  }

  return (
    <Container className="py-10 md:py-14">
      <div className="border-b border-border pb-6">
        <p className="label-eyebrow text-brand">Saved for later</p>
        <h1 className="mt-2 font-serif text-3xl tracking-tight md:text-4xl">
          Wishlist {hydrated && <span className="text-muted-foreground">({count})</span>}
        </h1>
      </div>
      <div className="mt-10">
        {hydrated ? (
          <ProductGrid products={items} priorityCount={4} />
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] animate-pulse bg-muted" />
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
