"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "@/lib/store/cart-context";
import { formatPrice } from "@/lib/format";
import type { CartItem } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CartLineItem({
  item,
  onNavigate,
  className,
}: {
  item: CartItem;
  onNavigate?: () => void;
  className?: string;
}) {
  const { updateQuantity, removeItem } = useCart();

  return (
    <div className={cn("flex gap-4", className)}>
      <Link
        href={`/products/${item.slug}`}
        onClick={onNavigate}
        className="relative aspect-[4/5] w-20 shrink-0 overflow-hidden bg-muted"
      >
        <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/products/${item.slug}`}
            onClick={onNavigate}
            className="text-sm font-medium leading-snug hover:underline"
          >
            {item.name}
          </Link>
          <button
            type="button"
            onClick={() => removeItem(item.key)}
            aria-label="Remove item"
            className="-mt-1 -mr-1 p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {item.color} · Size {item.size}
        </p>

        <div className="mt-auto flex items-center justify-between pt-3">
          <div className="inline-flex items-center border border-border">
            <button
              type="button"
              onClick={() => updateQuantity(item.key, item.quantity - 1)}
              aria-label="Decrease quantity"
              className="flex size-7 items-center justify-center text-foreground/70 hover:text-foreground"
            >
              <Minus className="size-3" />
            </button>
            <span className="w-7 text-center text-xs tabular-nums">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => updateQuantity(item.key, item.quantity + 1)}
              aria-label="Increase quantity"
              className="flex size-7 items-center justify-center text-foreground/70 hover:text-foreground"
            >
              <Plus className="size-3" />
            </button>
          </div>
          <span className="text-sm tabular-nums">
            {formatPrice(item.price * item.quantity)}
          </span>
        </div>
      </div>
    </div>
  );
}
