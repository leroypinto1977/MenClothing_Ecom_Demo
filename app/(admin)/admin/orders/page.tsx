import Link from "next/link";
import { Search } from "lucide-react";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import {
  getAdminOrders,
  getOrderCountsByStatus,
  ORDER_STATUSES,
} from "@/lib/admin/queries";
import { formatPrice, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = { title: "Orders" };

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status, q } = await searchParams;
  const [list, counts] = await Promise.all([
    getAdminOrders({ status, search: q }),
    getOrderCountsByStatus(),
  ]);

  const total = Object.values(counts).reduce((s, n) => s + n, 0);
  const filters = [
    { key: undefined, label: "All", count: total },
    ...ORDER_STATUSES.map((s) => ({ key: s, label: s.replace(/_/g, " "), count: counts[s] ?? 0 })),
  ].filter((f) => f.key === undefined || f.count > 0);

  const qs = (statusKey?: string) =>
    `/admin/orders${statusKey ? `?status=${statusKey}` : ""}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl tracking-tight md:text-3xl">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">{list.length} shown</p>
      </div>

      <form className="relative max-w-sm">
        {status && <input type="hidden" name="status" value={status} />}
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          name="q"
          defaultValue={q}
          placeholder="Search order number or email…"
          className="h-10 w-full border border-input bg-background pl-9 pr-3 text-sm outline-none focus-visible:border-foreground"
        />
      </form>

      <div className="flex flex-wrap gap-1.5">
        {filters.map((f) => (
          <Link
            key={f.label}
            href={qs(f.key)}
            className={cn(
              "inline-flex items-center gap-1.5 border px-3 py-1.5 text-xs capitalize transition-colors",
              (status ?? undefined) === f.key
                ? "border-foreground bg-foreground text-background"
                : "border-border hover:bg-secondary"
            )}
          >
            {f.label}
            <span className="tabular-nums opacity-70">{f.count}</span>
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30 text-left text-xs uppercase tracking-[0.1em] text-muted-foreground">
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Items</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {list.map((o) => (
              <tr key={o.id} className="border-b border-border last:border-0 hover:bg-secondary/20">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">
                    {o.number}
                  </Link>
                </td>
                <td className="max-w-[200px] truncate px-4 py-3 text-muted-foreground">{o.email}</td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                  {formatDate(o.placedAt.toISOString())}
                </td>
                <td className="px-4 py-3 tabular-nums">{o.items.length}</td>
                <td className="px-4 py-3"><OrderStatusBadge status={o.status} /></td>
                <td className="px-4 py-3 text-right tabular-nums">{formatPrice(o.total)}</td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
