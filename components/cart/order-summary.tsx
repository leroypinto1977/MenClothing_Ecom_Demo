"use client";

import * as React from "react";
import { toast } from "sonner";
import { useCart } from "@/lib/store/cart-context";
import { computeTotals } from "@/lib/cart-totals";
import { formatPrice } from "@/lib/format";

export function OrderSummary({
  showPromo = true,
  children,
  title = "Order Summary",
}: {
  showPromo?: boolean;
  children?: React.ReactNode;
  title?: string;
}) {
  const { subtotal, count } = useCart();
  const { shipping, tax, total } = computeTotals(subtotal);
  const [promo, setPromo] = React.useState("");

  const applyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promo.trim()) return;
    toast.success("Promo code applied", {
      description: "Demo store — discounts are illustrative only.",
    });
    setPromo("");
  };

  return (
    <div className="bg-secondary/40 p-6">
      <h2 className="font-serif text-xl">{title}</h2>

      {showPromo && (
        <form onSubmit={applyPromo} className="mt-5 flex gap-2">
          <input
            value={promo}
            onChange={(e) => setPromo(e.target.value)}
            placeholder="Promo code"
            className="h-10 w-full border border-input bg-background px-3 text-sm outline-none focus-visible:border-foreground"
          />
          <button
            type="submit"
            className="h-10 shrink-0 border border-foreground/70 px-4 text-xs font-medium uppercase tracking-[0.12em] transition-colors hover:bg-foreground hover:text-background"
          >
            Apply
          </button>
        </form>
      )}

      <dl className="mt-6 space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">
            Subtotal {count > 0 && `(${count} item${count > 1 ? "s" : ""})`}
          </dt>
          <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Shipping</dt>
          <dd className="tabular-nums">
            {shipping === 0 ? (
              <span className="text-brand">Complimentary</span>
            ) : (
              formatPrice(shipping)
            )}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-muted-foreground">GST</dt>
          <dd className="tabular-nums">{formatPrice(tax)}</dd>
        </div>
        <div className="mt-2 flex justify-between border-t border-border pt-3 text-base font-medium">
          <dt>Total</dt>
          <dd className="tabular-nums">{formatPrice(total)}</dd>
        </div>
      </dl>

      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
