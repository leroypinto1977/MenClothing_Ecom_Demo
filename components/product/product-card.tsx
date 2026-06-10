"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useCart } from "@/lib/store/cart-context";
import { useWishlist } from "@/lib/store/wishlist-context";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

const BADGE_LABEL: Record<string, string> = {
  new: "New",
  sale: "Sale",
  bestseller: "Bestseller",
  limited: "Limited",
};

export function ProductCard({
  product,
  priority = false,
  className,
}: {
  product: Product;
  priority?: boolean;
  className?: string;
}) {
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const saved = has(product.id);
  const onSale = Boolean(product.compareAtPrice);
  const href = `/products/${product.slug}`;

  // Surface the headline badge only (sale > new > limited > bestseller).
  const badge =
    (["sale", "new", "limited", "bestseller"] as const).find((b) =>
      product.badges.includes(b)
    ) ?? null;

  const quickAdd = (size: string) =>
    addItem(product, product.colors[0]?.name ?? "Default", size);

  return (
    <div className={cn("group relative", className)}>
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <Link href={href} className="absolute inset-0 block" aria-label={product.name}>
          <Image
            src={product.images[0].url}
            alt={product.name}
            fill
            sizes="(min-width:1280px) 22vw, (min-width:768px) 33vw, 50vw"
            priority={priority}
            className={cn(
              "object-cover transition-opacity duration-500",
              product.images[1] && "group-hover:opacity-0"
            )}
          />
          {product.images[1] && (
            <Image
              src={product.images[1].url}
              alt=""
              fill
              sizes="(min-width:1280px) 22vw, (min-width:768px) 33vw, 50vw"
              className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}
        </Link>

        {badge && (
          <span
            className={cn(
              "absolute left-3 top-3 z-10 px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.12em]",
              badge === "sale"
                ? "bg-brand text-brand-foreground"
                : "bg-background/90 text-foreground"
            )}
          >
            {BADGE_LABEL[badge]}
          </span>
        )}

        <button
          type="button"
          onClick={() => toggle(product)}
          aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
          className="absolute right-3 top-3 z-10 flex size-9 items-center justify-center rounded-full bg-background/80 text-foreground backdrop-blur transition-colors hover:bg-background"
        >
          <Heart className={cn("size-4", saved && "fill-brand text-brand")} />
        </button>

        {/* Quick add — slides up on hover (desktop) */}
        <div className="absolute inset-x-0 bottom-0 z-10 translate-y-full opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 max-md:hidden">
          <div className="bg-background/95 p-2.5 backdrop-blur">
            {product.sizes.length > 1 ? (
              <div className="flex items-center justify-center gap-1">
                {product.sizes.map((size) => {
                  const soldOut = product.soldOutSizes?.includes(size) ?? false;
                  return (
                    <button
                      key={size}
                      type="button"
                      disabled={soldOut}
                      title={soldOut ? "Out of stock" : undefined}
                      onClick={() => quickAdd(size)}
                      className={cn(
                        "min-w-8 flex-1 px-1 py-1.5 text-xs font-medium transition-colors",
                        soldOut
                          ? "cursor-not-allowed text-muted-foreground/40 line-through"
                          : "text-foreground/80 hover:bg-foreground hover:text-background"
                      )}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => quickAdd(product.sizes[0])}
                className="w-full bg-foreground py-2 text-xs font-medium uppercase tracking-[0.14em] text-background transition-colors hover:bg-foreground/85"
              >
                Add to bag
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Meta */}
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-medium">
            <Link href={href} className="hover:underline underline-offset-4">
              {product.name}
            </Link>
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {product.colors.length} colour{product.colors.length > 1 ? "s" : ""}
          </p>
        </div>
        <div className="shrink-0 text-right text-sm tabular-nums">
          {onSale ? (
            <span className="flex items-center gap-1.5">
              <span className="text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice!)}
              </span>
              <span className="text-brand">{formatPrice(product.price)}</span>
            </span>
          ) : (
            <span>{formatPrice(product.price)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
