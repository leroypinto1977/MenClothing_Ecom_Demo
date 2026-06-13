import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { OrderStatusBadge } from "@/components/admin/order-status-badge";
import { getCustomer } from "@/lib/admin/queries";
import { requireAdminArea } from "@/lib/admin/guard";
import { setUserBanned } from "@/app/(admin)/admin/_actions/users";
import { formatPrice, formatDate } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = await getCustomer(id);
  return { title: c ? c.user.name : "Customer" };
}

export default async function CustomerDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireAdminArea();
  const data = await getCustomer(id);
  if (!data) notFound();
  const { user, orders, addresses, ltv } = data;
  const isAdmin = session.user.role === "admin";

  return (
    <div className="max-w-4xl space-y-8">
      <Link
        href="/admin/customers"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" /> Customers
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl tracking-tight md:text-3xl">{user.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.12em] text-muted-foreground">
            {user.role} · joined {formatDate(user.createdAt.toISOString())}
            {user.banned && <span className="ml-2 text-destructive">account disabled</span>}
          </p>
        </div>
        {isAdmin && user.role !== "admin" && (
          <form action={setUserBanned}>
            <input type="hidden" name="id" value={user.id} />
            <input type="hidden" name="banned" value={user.banned ? "false" : "true"} />
            <button className="inline-flex h-9 items-center border border-border px-3 text-sm hover:bg-secondary">
              {user.banned ? "Re-enable account" : "Disable account"}
            </button>
          </form>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Stat label="Orders" value={String(orders.length)} />
        <Stat label="Lifetime value" value={formatPrice(ltv)} />
        <Stat label="Addresses" value={String(addresses.length)} />
      </div>

      <section>
        <h2 className="mb-4 font-serif text-xl">Order history</h2>
        <div className="overflow-x-auto border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30 text-left text-xs uppercase tracking-[0.1em] text-muted-foreground">
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-border last:border-0 hover:bg-secondary/20">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${o.id}`} className="font-medium hover:underline">
                      {o.number}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                    {formatDate(o.placedAt.toISOString())}
                  </td>
                  <td className="px-4 py-3"><OrderStatusBadge status={o.status} /></td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatPrice(o.total)}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {addresses.length > 0 && (
        <section>
          <h2 className="mb-4 font-serif text-xl">Addresses</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {addresses.map((a) => (
              <div key={a.id} className="border border-border p-4 text-sm">
                <p className="font-medium">{a.label}</p>
                <address className="mt-2 not-italic leading-relaxed text-muted-foreground">
                  {a.name}<br />
                  {a.line1}{a.line2 && <><br />{a.line2}</>}<br />
                  {a.city}, {a.postal}<br />
                  {a.country}
                </address>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border p-4">
      <p className="font-serif text-2xl tabular-nums">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
    </div>
  );
}
