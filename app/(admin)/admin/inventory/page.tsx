import Link from "next/link";
import { Search } from "lucide-react";
import { StockInput } from "@/components/admin/stock-input";
import { getInventory, LOW_STOCK_THRESHOLD } from "@/lib/admin/queries";
import { cn } from "@/lib/utils";

export const metadata = { title: "Inventory" };

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ low?: string; q?: string }>;
}) {
  const { low, q } = await searchParams;
  const isLow = low === "1";
  const rows = await getInventory({ low: isLow, search: q });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl tracking-tight md:text-3xl">Inventory</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {rows.length} variant{rows.length === 1 ? "" : "s"}
          {isLow && ` at or below ${LOW_STOCK_THRESHOLD} units`}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <form className="relative max-w-sm flex-1">
          {isLow && <input type="hidden" name="low" value="1" />}
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Search product or SKU…"
            className="h-10 w-full border border-input bg-background pl-9 pr-3 text-sm outline-none focus-visible:border-foreground"
          />
        </form>
        <div className="flex border border-border text-sm">
          <Link
            href="/admin/inventory"
            className={cn("px-4 py-2", !isLow ? "bg-foreground text-background" : "hover:bg-secondary")}
          >
            All
          </Link>
          <Link
            href="/admin/inventory?low=1"
            className={cn("px-4 py-2", isLow ? "bg-foreground text-background" : "hover:bg-secondary")}
          >
            Low stock
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30 text-left text-xs uppercase tracking-[0.1em] text-muted-foreground">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Colour</th>
              <th className="px-4 py-3 font-medium">Size</th>
              <th className="px-4 py-3 font-medium">Stock</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-0 hover:bg-secondary/20">
                <td className="px-4 py-2.5">
                  <Link href={`/admin/products/${r.productId}`} className="font-medium hover:underline">
                    {r.productName}
                  </Link>
                </td>
                <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{r.sku}</td>
                <td className="px-4 py-2.5">{r.color}</td>
                <td className="px-4 py-2.5">{r.size}</td>
                <td className="px-4 py-2.5">
                  <StockInput variantId={r.id} stock={r.stock} />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No variants found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
