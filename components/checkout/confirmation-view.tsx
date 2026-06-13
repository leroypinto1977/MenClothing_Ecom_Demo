"use client";

import * as React from "react";
import Image from "next/image";
import { Check, Package, Truck, Home } from "lucide-react";
import { Container } from "@/components/container";
import { SiteButton } from "@/components/site-button";
import { formatPrice } from "@/lib/format";
import { currentUser } from "@/lib/data/user";

interface StoredOrder {
  id: string;
  email: string;
  date: string;
  items: {
    key: string;
    name: string;
    image: string;
    color: string;
    size: string;
    quantity: number;
    price: number;
  }[];
  delivery?: { label: string; note: string };
  totals: { subtotal: number; shipping: number; tax: number; total: number };
}

const STEPS = [
  { Icon: Check, label: "Confirmed", active: true },
  { Icon: Package, label: "Preparing", active: false },
  { Icon: Truck, label: "On its way", active: false },
  { Icon: Home, label: "Delivered", active: false },
];

export function ConfirmationView() {
  const [order, setOrder] = React.useState<StoredOrder | null>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = sessionStorage.getItem("meridian.lastOrder");
      if (raw) setOrder(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  if (!ready) {
    return <Container className="py-28" />;
  }

  const email = order?.email ?? currentUser.email;
  const orderId = order?.id ?? "MER-10000";
  const eta = order?.delivery?.note ?? "2–4 business days";

  return (
    <Container className="py-14 md:py-20">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand/15 text-brand">
            <Check className="size-7" />
          </span>
          <p className="mt-6 label-eyebrow text-brand">Order confirmed</p>
          <h1 className="mt-3 font-serif text-3xl tracking-tight md:text-[2.5rem]">
            Thank you, {currentUser.firstName}.
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Your order <span className="font-medium text-foreground">{orderId}</span>{" "}
            is confirmed. We&apos;ve sent a receipt to{" "}
            <span className="font-medium text-foreground">{email}</span>.
          </p>
        </div>

        {/* Tracker */}
        <div className="mt-12 flex items-center justify-between">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.label}>
              <div className="flex flex-col items-center gap-2">
                <span
                  className={
                    "flex size-10 items-center justify-center rounded-full border " +
                    (s.active
                      ? "border-brand bg-brand text-brand-foreground"
                      : "border-border text-muted-foreground")
                  }
                >
                  <s.Icon className="size-4" />
                </span>
                <span className={s.active ? "text-xs font-medium" : "text-xs text-muted-foreground"}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <span className="mx-1 -mt-6 h-px flex-1 bg-border" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Order detail */}
        <div className="mt-12 border border-border">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <p className="text-sm font-medium">Order summary</p>
            <p className="text-xs text-muted-foreground">
              Estimated delivery · {eta}
            </p>
          </div>

          {order && order.items.length > 0 ? (
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
          ) : (
            <p className="px-5 py-6 text-sm text-muted-foreground">
              Your order is being processed.
            </p>
          )}

          {order && (
            <dl className="space-y-2 border-t border-border px-5 py-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="tabular-nums">{formatPrice(order.totals.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Shipping</dt>
                <dd className="tabular-nums">
                  {order.totals.shipping === 0
                    ? "Complimentary"
                    : formatPrice(order.totals.shipping)}
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
          )}
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
