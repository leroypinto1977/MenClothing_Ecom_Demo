"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Heart, Minus, Plus, Truck, RotateCcw, Check } from "lucide-react";
import { Container } from "@/components/container";
import { SiteButton } from "@/components/site-button";
import { StarRating } from "@/components/product/star-rating";
import { ProductGallery } from "@/components/product/product-gallery";
import { SizeGuide } from "@/components/product/size-guide";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useCart } from "@/lib/store/cart-context";
import { useWishlist } from "@/lib/store/wishlist-context";
import { formatPrice } from "@/lib/format";
import { getCategory } from "@/lib/data";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

export function ProductDetail({ product }: { product: Product }) {
  const { addItem } = useCart();
  const { has, toggle } = useWishlist();
  const saved = has(product.id);
  const category = getCategory(product.category);

  const [colorIndex, setColorIndex] = React.useState(0);
  const oneSize = product.sizes.length === 1;
  const [size, setSize] = React.useState<string | null>(
    oneSize ? product.sizes[0] : null
  );
  const [qty, setQty] = React.useState(1);
  const [sizeError, setSizeError] = React.useState(false);

  const color = product.colors[colorIndex];
  const onSale = Boolean(product.compareAtPrice);

  const addToBag = () => {
    if (!size) {
      setSizeError(true);
      toast.error("Please select a size");
      return;
    }
    addItem(product, color.name, size, qty);
  };

  return (
    <>
      <Container className="py-6 md:py-10">
        <nav className="mb-6 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span className="px-1.5">/</span>
          <Link href={`/shop/${product.category}`} className="hover:text-foreground">
            {category?.name}
          </Link>
          <span className="px-1.5">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="grid gap-10 md:grid-cols-2 lg:gap-16">
          {/* Gallery */}
          <div className="md:sticky md:top-24 md:self-start">
            <ProductGallery images={product.images} />
          </div>

          {/* Buy box */}
          <div className="md:py-2">
            <div className="flex items-center gap-3">
              {product.badges.includes("bestseller") && (
                <span className="label-eyebrow text-brand">Bestseller</span>
              )}
              {category && (
                <Link
                  href={`/shop/${product.category}`}
                  className="label-eyebrow text-muted-foreground hover:text-foreground"
                >
                  {category.name}
                </Link>
              )}
            </div>

            <h1 className="mt-3 font-serif text-3xl leading-tight tracking-tight md:text-4xl">
              {product.name}
            </h1>
            <p className="mt-2 text-muted-foreground">{product.subtitle}</p>

            <div className="mt-5 flex items-center gap-4">
              <div className="flex items-baseline gap-2.5 text-lg tabular-nums">
                {onSale && (
                  <span className="text-muted-foreground line-through">
                    {formatPrice(product.compareAtPrice!)}
                  </span>
                )}
                <span className={cn(onSale && "text-brand")}>
                  {formatPrice(product.price)}
                </span>
              </div>
              <span className="h-4 w-px bg-border" />
              <Link href="#reviews" className="flex items-center gap-2 text-sm">
                <StarRating rating={product.rating} />
                <span className="text-muted-foreground underline-offset-4 hover:underline">
                  {product.reviewCount} reviews
                </span>
              </Link>
            </div>

            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            {/* Colour */}
            <div className="mt-8">
              <p className="text-sm">
                <span className="font-medium">Colour</span>
                <span className="text-muted-foreground"> — {color.name}</span>
              </p>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {product.colors.map((c, i) => (
                  <button
                    key={c.name}
                    type="button"
                    title={c.name}
                    aria-label={c.name}
                    onClick={() => setColorIndex(i)}
                    className={cn(
                      "size-9 rounded-full ring-offset-2 ring-offset-background transition-all",
                      colorIndex === i
                        ? "ring-2 ring-foreground"
                        : "ring-1 ring-border hover:ring-foreground/40"
                    )}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>

            {/* Size */}
            <div className="mt-7">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  Size {!oneSize && size && <span className="text-muted-foreground font-normal">— {size}</span>}
                </p>
                <SizeGuide />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {product.sizes.map((s) => {
                  const soldOut = product.soldOutSizes?.includes(s) ?? false;
                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={soldOut}
                      title={soldOut ? "Out of stock" : undefined}
                      onClick={() => {
                        setSize(s);
                        setSizeError(false);
                      }}
                      className={cn(
                        "min-w-12 border px-4 py-2.5 text-sm transition-colors",
                        soldOut
                          ? "cursor-not-allowed border-border text-muted-foreground/50 line-through"
                          : size === s
                            ? "border-foreground bg-foreground text-background"
                            : "border-border hover:border-foreground",
                        sizeError && !soldOut && "border-destructive"
                      )}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
              {product.soldOutSizes && product.soldOutSizes.length > 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  {product.soldOutSizes.join(", ")} currently out of stock.
                </p>
              )}
              {sizeError && (
                <p className="mt-2 text-xs text-destructive">
                  Please select a size to continue.
                </p>
              )}
            </div>

            {/* Quantity + Add */}
            <div className="mt-8 flex gap-3">
              <div className="inline-flex h-[3.25rem] items-center border border-border">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="flex size-12 items-center justify-center text-foreground/70 hover:text-foreground"
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-8 text-center text-sm tabular-nums">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="flex size-12 items-center justify-center text-foreground/70 hover:text-foreground"
                >
                  <Plus className="size-4" />
                </button>
              </div>
              <SiteButton size="blockLg" onClick={addToBag} className="flex-1">
                Add to bag — {formatPrice(product.price * qty)}
              </SiteButton>
              <button
                type="button"
                onClick={() => toggle(product)}
                aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
                className="flex size-[3.25rem] shrink-0 items-center justify-center border border-border transition-colors hover:border-foreground"
              >
                <Heart className={cn("size-5", saved && "fill-brand text-brand")} />
              </button>
            </div>

            {/* Assurances */}
            <div className="mt-6 space-y-2.5 border-t border-border pt-6 text-sm text-muted-foreground">
              <p className="flex items-center gap-2.5">
                <Truck className="size-4 text-foreground" />
                Complimentary shipping over ₹12,000 · arrives in 2–4 days
              </p>
              <p className="flex items-center gap-2.5">
                <RotateCcw className="size-4 text-foreground" />
                Free 30-day returns
              </p>
              <p className="flex items-center gap-2.5">
                <Check className="size-4 text-foreground" />
                In stock — {color.name}, ready to ship
              </p>
            </div>

            {/* Accordions */}
            <Accordion defaultValue={["description"]} className="mt-8">
              <AccordionItem value="description">
                <AccordionTrigger>Description</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">{product.description}</p>
                  <p className="mt-3 text-muted-foreground">
                    Fit: {product.fit}. Model is 6&apos;1&quot; and wears a size M.
                  </p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="fabric">
                <AccordionTrigger>Fabric &amp; Care</AccordionTrigger>
                <AccordionContent>
                  <ul className="space-y-1.5 text-muted-foreground">
                    {product.details.map((d) => (
                      <li key={d} className="flex gap-2">
                        <span className="text-brand">·</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="shipping">
                <AccordionTrigger>Shipping &amp; Returns</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground">
                    Complimentary standard shipping on orders over ₹12,000. Express
                    options available at checkout. Enjoy 30 days to return
                    unworn items with tags attached — returns are free.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </Container>
    </>
  );
}
