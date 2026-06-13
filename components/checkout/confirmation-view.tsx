import * as React from "react";
import Image from "next/image";
import { Check, Package, Truck, Home } from "lucide-react";
import { Container } from "@/components/container";
import { SiteButton } from "@/components/site-button";
import { formatPrice } from "@/lib/format";
import type { OrderDbStatus } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

interface ConfirmationOrder {
  number: string;
  email: string;
  status: OrderDbStatus;
  deliveryMethod: string | null;
  items: {
    key: string;
    name: string;
    image: string;
    color: string;
    size: string;
    quantity: number;
    price: number;
  }[];
  totals: { subtotal: number; shipping: number; tax: number; total: number };
}

const STEPS = [
  { Icon: Check, label: "Confirmed", statuses: ["paid", "processing", "shipped", "delivered"] },
  { Icon: Package, label: "Preparing", statuses: ["processing", "shipped", "delivered"] },
  { Icon: Truck, label: "On its way", statuses: ["shipped", "delivered"] },
  { Icon: Home, label: "Delivered", statuses: ["delivered"] },
];

const ETA: Record<string, string> = {
  standard: "2–4 business days",
  express: "1–2 business days",
  collect: "Ready in 2 hours",
};

export function ConfirmationView({ order }: { order: ConfirmationOrder | null }) {
  if (!order) {
    return (
      <Container className="flex flex-col items-center justify-center gap-5 py-28 text-center">
        <h1 className="font-serif text-3xl">Order not found</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          We couldn&apos;t find that order. If you just checked out, please check
          your email for the confirmation.
        </p>
        <SiteButton href="/shop" size="lg">
          Continue shopping
        </SiteButton>
      </Container>
    );
  }

  const eta = ETA[order.deliveryMethod ?? "standard"] ?? "2–4 business days";

  return (
    <Container className="py-14 md:py-20">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand/15 text-brand">
            <Check className="size-7" />
          </span>
          <p className="mt-6 label-eyebrow text-brand">Order confirmed</p>
          <h1 className="mt-3 font-serif text-3xl tracking-tight md:text-[2.5rem]">
            Thank you.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Your order <span className="font-medium text-foreground">{order.number}</span>{" "}
            is confirmed. We&apos;ve sent a receipt to{" "}
            <span className="font-medium text-foreground">{order.email}</span>.
          </p>
        </div>

        {/* Tracker */}
        <div className="mt-12 flex items-center justify-between">
          {STEPS.map((s, i) => {
            const active = s.statuses.includes(order.status);
            return (
              <React.Fragment key={s.label}>
                <div className="flex flex-col items-center gap-2">
                  <span
                    className={cn(
                      "flex size-10 items-center justify-center rounded-full border",
                      active
                        ? "border-brand bg-brand text-brand-foreground"
                        : "border-border text-muted-foreground"
                    )}
                  >
                    <s.Icon className="size-4" />
                  </span>
                  <span className={active ? "text-xs font-medium" : "text-xs text-muted-foreground"}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <span className="mx-1 -mt-6 h-px flex-1 bg-border" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Order detail */}
        <div className="mt-12 border border-border">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <p className="text-sm font-medium">Order summary</p>
            <p className="text-xs text-muted-foreground">Estimated delivery · {eta}</p>
          </div>

          <ul className="divide-y divide-border">
            {order.items.map((item) => (
              <li key={item.key} className="flex gap-4 px-5 py-4">
                <div className="relative size-16 shrink-0 overflow-hidden bg-muted">
                  <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.color} · {item.size} · Qty {item.quantity}
                  </p>
                </div>
                <span className="text-sm tabular-nums">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <dl className="space-y-2 border-t border-border px-5 py-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="tabular-nums">{formatPrice(order.totals.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Shipping</dt>
              <dd className="tabular-nums">
                {order.totals.shipping === 0 ? "Complimentary" : formatPrice(order.totals.shipping)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">GST</dt>
              <dd className="tabular-nums">{formatPrice(order.totals.tax)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2 font-medium">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatPrice(order.totals.total)}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <SiteButton href="/shop" size="lg">
            Continue shopping
          </SiteButton>
          <SiteButton href="/account" variant="outline" size="lg">
            View my orders
          </SiteButton>
        </div>
      </div>
    </Container>
  );
}
