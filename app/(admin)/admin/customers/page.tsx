import Link from "next/link";
import { Search } from "lucide-react";
import { getCustomers } from "@/lib/admin/queries";
import { formatPrice, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = { title: "Customers" };

const ROLE_STYLES: Record<string, string> = {
  admin: "bg-brand/10 text-brand",
  staff: "bg-foreground/10 text-foreground",
  customer: "bg-secondary text-muted-foreground",
};

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const customers = await getCustomers(q);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl tracking-tight md:text-3xl">Customers</h1>
        <p className="mt-1 text-sm text-muted-foreground">{customers.length} accounts</p>
      </div>

      <form className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          name="q"
          defaultValue={q}
          placeholder="Search name or email…"
          className="h-10 w-full border border-input bg-background pl-9 pr-3 text-sm outline-none focus-visible:border-foreground"
        />
      </form>

      <div className="overflow-x-auto border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30 text-left text-xs uppercase tracking-[0.1em] text-muted-foreground">
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 text-right font-medium">Orders</th>
              <th className="px-4 py-3 text-right font-medium">Lifetime value</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/20">
                <td className="px-4 py-3">
                  <Link href={`/admin/customers/${c.id}`} className="block hover:underline">
                    <span className="font-medium">{c.name}</span>
                    {c.banned && <span className="ml-2 text-xs text-destructive">disabled</span>}
                    <span className="block text-xs text-muted-foreground">{c.email}</span>
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize", ROLE_STYLES[c.role])}>
                    {c.role}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                  {formatDate(c.createdAt.toISOString())}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{c.orderCount}</td>
                <td className="px-4 py-3 text-right tabular-nums">{formatPrice(c.lifetimeValue)}</td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
