import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { getAdminOrder } from "@/lib/admin/queries";
import { requireAdminArea } from "@/lib/admin/guard";
import {
  advanceOrderStatus,
  addTracking,
  addOrderNote,
  refundOrder,
} from "@/app/(admin)/admin/_actions/orders";
import { canTransition } from "@/lib/orders";
import { formatPrice, formatDate } from "@/lib/format";
import type { OrderDbStatus } from "@/lib/db/schema";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getAdminOrder(id);
  return { title: order ? `Order ${order.number}` : "Order" };
}

// Primary forward actions surfaced as buttons, keyed by current status.
const FORWARD: Partial<Record<OrderDbStatus, { to: OrderDbStatus; label: string }>> = {
  paid: { to: "processing", label: "Start fulfilment" },
  processing: { to: "shipped", label: "Mark shipped" },
  shipped: { to: "delivered", label: "Mark delivered" },
};

export default async function AdminOrderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireAdminArea();
  const order = await getAdminOrder(id);
  if (!order) notFound();

  const isAdmin = session.user.role === "admin";
  const forward = FORWARD[order.status];
  const canCancel = canTransition(order.status, "cancelled");
  const canRefund =
    isAdmin && ["paid", "processing", "shipped", "delivered"].includes(order.status);
  const addr = order.shippingAddress;
  const payment = order.payments[0];

  return (
    <div className="max-w-5xl space-y-8">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" /> Orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-serif text-2xl tracking-tight md:text-3xl">{order.number}</h1>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="text-sm text-muted-foreground">
          {formatDate(order.placedAt.toISOString())}
        </p>
      </div>

      {/* Fulfilment actions */}
      <section className="flex flex-wrap items-center gap-3 border border-border p-4">
        {forward && (
          <form action={advanceOrderStatus}>
            <input type="hidden" name="id" value={order.id} />
            <input type="hidden" name="to" value={forward.to} />
            <button className="inline-flex h-10 items-center bg-foreground px-4 text-sm font-medium text-background hover:bg-foreground/85">
              {forward.label}
            </button>
          </form>
        )}
        {canCancel && (
          <form action={advanceOrderStatus}>
            <input type="hidden" name="id" value={order.id} />
            <input type="hidden" name="to" value="cancelled" />
            <button className="inline-flex h-10 items-center border border-border px-4 text-sm hover:bg-secondary">
              Cancel order
            </button>
          </form>
        )}
        {canRefund && (
          <form action={refundOrder}>
            <input type="hidden" name="id" value={order.id} />
            <button className="inline-flex h-10 items-center border border-destructive/40 px-4 text-sm text-destructive hover:bg-destructive/5">
              Refund
            </button>
          </form>
        )}
        {!forward && !canCancel && !canRefund && (
          <p className="text-sm text-muted-foreground">No actions available in this state.</p>
        )}
      </section>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          {/* Items */}
          <section className="border border-border">
            <div className="border-b border-border px-4 py-3 text-sm font-medium">
              Items ({order.items.length})
            </div>
            <ul className="divide-y divide-border">
              {order.items.map((it) => (
                <li key={it.id} className="flex items-center gap-3 px-4 py-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={it.image} alt="" className="size-12 shrink-0 object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{it.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {it.color} · {it.size} · Qty {it.quantity}
                      {it.variantSku && <span className="ml-2 font-mono">{it.variantSku}</span>}
                    </p>
                  </div>
                  <span className="text-sm tabular-nums">
                    {formatPrice(it.unitPrice * it.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <dl className="space-y-1.5 border-t border-border px-4 py-3 text-sm">
              <Row label="Subtotal" value={formatPrice(order.subtotal)} />
              <Row label="Shipping" value={order.shipping === 0 ? "Free" : formatPrice(order.shipping)} />
              <Row label="GST" value={formatPrice(order.tax)} />
              <Row label="Total" value={formatPrice(order.total)} strong />
            </dl>
          </section>

          {/* Tracking */}
          <section className="border border-border p-4">
            <h2 className="mb-3 text-sm font-medium">Shipment tracking</h2>
            <form action={addTracking} className="grid gap-3 sm:grid-cols-2">
              <input type="hidden" name="id" value={order.id} />
              <input
                name="carrier"
                defaultValue={order.carrier ?? ""}
                placeholder="Carrier (e.g. Delhivery)"
                className="h-10 border border-input bg-background px-3 text-sm outline-none focus-visible:border-foreground"
              />
              <input
                name="trackingNumber"
                defaultValue={order.trackingNumber ?? ""}
                placeholder="Tracking number"
                required
                className="h-10 border border-input bg-background px-3 text-sm outline-none focus-visible:border-foreground"
              />
              <input
                name="trackingUrl"
                defaultValue={order.trackingUrl ?? ""}
                placeholder="Tracking URL (optional)"
                className="h-10 border border-input bg-background px-3 text-sm outline-none focus-visible:border-foreground sm:col-span-2"
              />
              <button className="inline-flex h-10 items-center justify-center border border-foreground px-4 text-sm font-medium hover:bg-foreground hover:text-background sm:col-span-2">
                Save tracking {order.status === "paid" || order.status === "processing" ? "& mark shipped" : ""}
              </button>
            </form>
          </section>

          {/* Timeline */}
          <section className="border border-border p-4">
            <h2 className="mb-4 text-sm font-medium">Timeline</h2>
            <ol className="space-y-3">
              {order.events.map((e) => (
                <li key={e.id} className="flex gap-3 text-sm">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-foreground/40" />
                  <div>
                    <p>{e.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(e.createdAt.toISOString())} ·{" "}
                      {e.createdAt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <form action={addOrderNote} className="mt-4 flex gap-2 border-t border-border pt-4">
              <input type="hidden" name="id" value={order.id} />
              <input
                name="message"
                placeholder="Add an internal note…"
                required
                className="h-10 flex-1 border border-input bg-background px-3 text-sm outline-none focus-visible:border-foreground"
              />
              <button className="inline-flex h-10 items-center border border-border px-4 text-sm hover:bg-secondary">
                Add
              </button>
            </form>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <section className="border border-border p-4 text-sm">
            <h2 className="mb-2 text-xs uppercase tracking-[0.12em] text-muted-foreground">Customer</h2>
            {order.user ? (
              <Link href={`/admin/customers/${order.user.id}`} className="font-medium hover:underline">
                {order.user.name}
              </Link>
            ) : (
              <p className="font-medium">Guest</p>
            )}
            <p className="text-muted-foreground">{order.email}</p>
          </section>

          {addr && (
            <section className="border border-border p-4 text-sm">
              <h2 className="mb-2 text-xs uppercase tracking-[0.12em] text-muted-foreground">Ship to</h2>
              <address className="not-italic leading-relaxed text-muted-foreground">
                <span className="text-foreground">{addr.name}</span>
                <br />
                {addr.line1}
                {addr.line2 && <><br />{addr.line2}</>}
                <br />
                {addr.city}{addr.region ? `, ${addr.region}` : ""} {addr.postal}
                <br />
                {addr.country}
                {addr.phone && <><br />{addr.phone}</>}
              </address>
            </section>
          )}

          <section className="border border-border p-4 text-sm">
            <h2 className="mb-2 text-xs uppercase tracking-[0.12em] text-muted-foreground">Payment</h2>
            {payment ? (
              <div className="space-y-1">
                <p className="capitalize">
                  {payment.provider} · <span className="capitalize">{payment.status}</span>
                </p>
                {payment.method && <p className="text-muted-foreground capitalize">{payment.method}</p>}
                {payment.providerPaymentId && (
                  <p className="font-mono text-xs text-muted-foreground">{payment.providerPaymentId}</p>
                )}
                {payment.refunds.length > 0 && (
                  <p className="text-destructive">
                    Refunded {formatPrice(payment.refunds[0].amount)}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">Awaiting payment</p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={"flex justify-between " + (strong ? "border-t border-border pt-2 font-medium" : "")}>
      <dt className={strong ? "" : "text-muted-foreground"}>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}
