"use client";

import * as React from "react";
import { Heart } from "lucide-react";
import { Container } from "@/components/container";
import { SiteButton } from "@/components/site-button";
import { ProductGrid } from "@/components/product/product-grid";
import { useWishlist } from "@/lib/store/wishlist-context";
import type { Product } from "@/lib/types";

export function WishlistView() {
  const { ids, hydrated, count } = useWishlist();
  // null = still resolving ids against the catalog API.
  const [fetched, setFetched] = React.useState<Product[] | null>(null);

  React.useEffect(() => {
    if (!hydrated || ids.length === 0) return;
    let active = true;
    fetch(`/api/products?ids=${ids.map(encodeURIComponent).join(",")}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Product[]) => {
        if (active) setFetched(data);
      })
      .catch(() => {
        if (active) setFetched([]);
      });
    return () => {
      active = false;
    };
  }, [hydrated, ids]);

  const items = ids.length === 0 ? [] : fetched;

  if (hydrated && items && items.length === 0) {
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
        {hydrated && items ? (
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
