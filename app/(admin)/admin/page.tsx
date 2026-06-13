import Link from "next/link";
import { AlertTriangle, ArrowUpRight } from "lucide-react";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { getDashboardStats } from "@/lib/admin/queries";
import { formatPrice, formatDate } from "@/lib/format";

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  const cards = [
    { label: "Revenue today", value: formatPrice(stats.revenue.today) },
    { label: "Revenue · 7 days", value: formatPrice(stats.revenue.week) },
    { label: "Revenue · 30 days", value: formatPrice(stats.revenue.month) },
    { label: "Orders · 30 days", value: String(stats.revenue.ordersMonth) },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif text-2xl tracking-tight md:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Storefront performance at a glance.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="border border-border p-5">
            <p className="font-serif text-2xl tabular-nums">{c.value}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.12em] text-muted-foreground">
              {c.label}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-center justify-between border border-border p-5">
          <div>
            <p className="font-serif text-2xl tabular-nums">{stats.toFulfill}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Orders awaiting fulfilment
            </p>
          </div>
        </div>
        <Link
          href="/admin/inventory?low=1"
          className="flex items-center justify-between border border-border p-5 transition-colors hover:bg-secondary/40"
        >
          <div>
            <p className="flex items-center gap-2 font-serif text-2xl tabular-nums">
              {stats.lowStockCount}
              {stats.lowStockCount > 0 && (
                <AlertTriangle className="size-4 text-brand" />
              )}
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.12em] text-muted-foreground">
              Low-stock variants
            </p>
          </div>
          <ArrowUpRight className="size-4 text-muted-foreground" />
        </Link>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <section>
          <h2 className="mb-4 font-serif text-xl">Recent orders</h2>
          <div className="overflow-x-auto border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30 text-left text-xs uppercase tracking-[0.1em] text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-medium">{o.number}</td>
                    <td className="max-w-[180px] truncate px-4 py-3 text-muted-foreground">
                      {o.email}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                      {formatDate(o.placedAt.toISOString())}
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={o.status} />
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatPrice(o.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="mb-4 font-serif text-xl">Top products · 30 days</h2>
          <div className="divide-y divide-border border border-border">
            {stats.topProducts.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground">No sales yet.</p>
            )}
            {stats.topProducts.map((p) => (
              <div key={p.name} className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.units} units</p>
                </div>
                <span className="text-sm tabular-nums">{formatPrice(p.revenue)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
