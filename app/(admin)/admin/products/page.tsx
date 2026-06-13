import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { getAdminProducts } from "@/lib/admin/queries";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = { title: "Products" };

const STATUS_STYLES: Record<string, string> = {
  active: "bg-brand/10 text-brand",
  draft: "bg-secondary text-muted-foreground",
  archived: "bg-foreground/10 text-muted-foreground",
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const products = await getAdminProducts(q);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl tracking-tight md:text-3xl">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {products.length} product{products.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex h-10 items-center gap-2 bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-foreground/85"
        >
          <Plus className="size-4" /> New product
        </Link>
      </div>

      <form className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          name="q"
          defaultValue={q}
          placeholder="Search products…"
          className="h-10 w-full border border-input bg-background pl-9 pr-3 text-sm outline-none focus-visible:border-foreground"
        />
      </form>

      <div className="overflow-x-auto border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30 text-left text-xs uppercase tracking-[0.1em] text-muted-foreground">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/20">
                <td className="px-4 py-3">
                  <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                    {p.images[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.images[0].thumb}
                        alt=""
                        className="size-10 shrink-0 object-cover"
                      />
                    )}
                    <span className="font-medium">{p.name}</span>
                  </Link>
                </td>
                <td className="px-4 py-3 capitalize text-muted-foreground">{p.categorySlug}</td>
                <td className="whitespace-nowrap px-4 py-3 tabular-nums">
                  {formatPrice(p.price)}
                  {p.compareAtPrice && (
                    <span className="ml-1.5 text-xs text-muted-foreground line-through">
                      {formatPrice(p.compareAtPrice)}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 tabular-nums">
                  <span className={cn(p.totalStock === 0 && "text-destructive")}>
                    {p.totalStock}
                  </span>
                  {p.lowVariants > 0 && (
                    <span className="ml-1.5 text-xs text-brand">
                      ({p.lowVariants} low)
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                      STATUS_STYLES[p.status]
                    )}
                  >
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
