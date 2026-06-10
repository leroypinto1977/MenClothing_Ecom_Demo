"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Lock, Check, ShoppingBag } from "lucide-react";
import { Container } from "@/components/container";
import { Field } from "@/components/form-field";
import { SiteButton } from "@/components/site-button";
import { useCart } from "@/lib/store/cart-context";
import { computeTotals } from "@/lib/cart-totals";
import { formatPrice } from "@/lib/format";
import { currentUser } from "@/lib/data";
import { cn } from "@/lib/utils";

const DELIVERY = [
  { id: "standard", label: "Standard", note: "2–4 business days", price: 0 },
  { id: "express", label: "Express", note: "1–2 business days", price: 1200 },
  { id: "collect", label: "Collect in store", note: "Ready in 2 hours", price: 0 },
];

export function CheckoutView() {
  const { items, subtotal, clearCart, hydrated } = useCart();
  const router = useRouter();
  const [delivery, setDelivery] = React.useState("standard");
  const [email, setEmail] = React.useState(currentUser.email);
  const [placing, setPlacing] = React.useState(false);

  const base = computeTotals(subtotal);
  // Standard follows the free-over-₹12,000 rule; express is a flat upgrade.
  const priceFor = (id: string) =>
    id === "express" ? 1200 : id === "collect" ? 0 : base.shipping;
  const deliveryPrice = priceFor(delivery);
  const total = base.subtotal + base.tax + deliveryPrice;

  const placeOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Your bag is empty");
      return;
    }
    setPlacing(true);
    const id = `MER-${10000 + Math.floor(Math.random() * 89999)}`;
    const order = {
      id,
      email,
      date: new Date().toISOString(),
      items,
      delivery: DELIVERY.find((d) => d.id === delivery),
      totals: { ...base, shipping: deliveryPrice, total },
    };
    try {
      sessionStorage.setItem("meridian.lastOrder", JSON.stringify(order));
    } catch {
      /* ignore */
    }
    clearCart();
    router.push("/order-confirmation");
  };

  if (hydrated && items.length === 0) {
    return (
      <Container className="flex flex-col items-center justify-center gap-5 py-28 text-center">
        <ShoppingBag className="size-12 text-muted-foreground/40" strokeWidth={1} />
        <h1 className="font-serif text-3xl">Your bag is empty</h1>
        <SiteButton href="/shop" size="lg">
          Start shopping
        </SiteButton>
      </Container>
    );
  }

  return (
    <Container className="py-10 md:py-14">
      <div className="mb-8 flex items-center justify-between border-b border-border pb-6">
        <h1 className="font-serif text-3xl tracking-tight md:text-4xl">Checkout</h1>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="size-3.5" /> Secure checkout
        </span>
      </div>

        <form
          onSubmit={placeOrder}
          className="grid gap-12 lg:grid-cols-[1fr_420px] lg:gap-16"
        >
          {/* Left — form */}
          <div className="space-y-10">
            {/* Express */}
            <div>
              <div className="grid grid-cols-3 gap-3">
                {["Apple Pay", "G Pay", "PayPal"].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => toast("Demo store — express pay is illustrative")}
                    className="flex h-11 items-center justify-center border border-border text-sm font-medium transition-colors hover:bg-secondary"
                  >
                    {m}
                  </button>
                ))}
              </div>
              <div className="my-7 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                or continue with details
                <span className="h-px flex-1 bg-border" />
              </div>
            </div>

            <Section step={1} title="Contact">
              <Field
                label="Email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Section>

            <Section step={2} title="Shipping address">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="First name" defaultValue={currentUser.firstName} required />
                <Field label="Last name" defaultValue="Whitfield" required />
                <Field
                  label="Address"
                  className="sm:col-span-2"
                  defaultValue={currentUser.addresses[0].line1}
                  required
                />
                <Field label="Apartment, suite (optional)" className="sm:col-span-2" defaultValue={currentUser.addresses[0].line2} />
                <Field label="City" defaultValue={currentUser.addresses[0].city} required />
                <Field label="Postcode" defaultValue={currentUser.addresses[0].postal} required />
                <Field label="Country" defaultValue={currentUser.addresses[0].country} required />
                <Field label="Phone" type="tel" defaultValue="+44 7700 900123" />
              </div>
            </Section>

            <Section step={3} title="Delivery method">
              <div className="space-y-3">
                {DELIVERY.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setDelivery(d.id)}
                    className={cn(
                      "flex w-full items-center justify-between border px-4 py-3.5 text-left transition-colors",
                      delivery === d.id
                        ? "border-foreground bg-secondary/50"
                        : "border-border hover:border-foreground/40"
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={cn(
                          "flex size-4 items-center justify-center rounded-full border",
                          delivery === d.id ? "border-foreground" : "border-input"
                        )}
                      >
                        {delivery === d.id && (
                          <span className="size-2 rounded-full bg-foreground" />
                        )}
                      </span>
                      <span>
                        <span className="block text-sm font-medium">{d.label}</span>
                        <span className="block text-xs text-muted-foreground">
                          {d.note}
                        </span>
                      </span>
                    </span>
                    <span className="text-sm tabular-nums">
                      {priceFor(d.id) === 0 ? "Free" : formatPrice(priceFor(d.id))}
                    </span>
                  </button>
                ))}
              </div>
            </Section>

            <Section step={4} title="Payment">
              <p className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="size-3.5" />
                All transactions are encrypted and secure.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Card number" className="sm:col-span-2" placeholder="4242 4242 4242 4242" defaultValue="4242 4242 4242 4242" />
                <Field label="Expiry" placeholder="MM / YY" defaultValue="04 / 28" />
                <Field label="CVC" placeholder="123" defaultValue="123" />
                <Field label="Name on card" className="sm:col-span-2" defaultValue={currentUser.name} />
              </div>
            </Section>
          </div>

          {/* Right — summary */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="bg-secondary/40 p-6">
              <h2 className="font-serif text-xl">Order summary</h2>
              <ul className="mt-5 space-y-4">
                {items.map((item) => (
                  <li key={item.key} className="flex gap-3">
                    <div className="relative size-16 shrink-0 overflow-hidden bg-muted">
                      <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                      <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-foreground text-[0.65rem] text-background">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.color} · {item.size}
                      </p>
                    </div>
                    <span className="text-sm tabular-nums">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              <dl className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="tabular-nums">{formatPrice(base.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Shipping</dt>
                  <dd className="tabular-nums">
                    {deliveryPrice === 0 ? (
                      <span className="text-brand">Complimentary</span>
                    ) : (
                      formatPrice(deliveryPrice)
                    )}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">GST</dt>
                  <dd className="tabular-nums">{formatPrice(base.tax)}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-3 text-base font-medium">
                  <dt>Total</dt>
                  <dd className="tabular-nums">{formatPrice(total)}</dd>
                </div>
              </dl>

              <SiteButton size="block" className="mt-6" disabled={placing}>
                {placing ? "Placing order…" : `Place order — ${formatPrice(total)}`}
              </SiteButton>

              <ul className="mt-5 space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="size-3.5 text-brand" /> Free 30-day returns
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-3.5 text-brand" /> Carbon-neutral delivery
                </li>
              </ul>
              <Link
                href="/cart"
                className="mt-4 block text-center text-xs text-foreground/70 underline-offset-4 hover:underline"
              >
                Return to bag
              </Link>
            </div>
          </div>
        </form>
    </Container>
  );
}

function Section({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-4 flex items-center gap-3 text-lg">
        <span className="flex size-6 items-center justify-center rounded-full bg-foreground text-xs text-background">
          {step}
        </span>
        <span className="font-serif text-xl">{title}</span>
      </h2>
      {children}
    </section>
  );
}
