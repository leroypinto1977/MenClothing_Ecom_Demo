import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ProductForm } from "@/components/admin/product-form";
import { categories } from "@/lib/data";

export const metadata = { title: "New product" };

export default function NewProductPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" /> Products
      </Link>
      <h1 className="font-serif text-2xl tracking-tight md:text-3xl">New product</h1>
      <ProductForm categories={categories.map((c) => ({ slug: c.slug, name: c.name }))} />
    </div>
  );
}
