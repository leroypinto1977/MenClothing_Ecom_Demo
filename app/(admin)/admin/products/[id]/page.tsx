import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { ProductForm, type ProductFormData } from "@/components/admin/product-form";
import { getAdminProduct } from "@/lib/admin/queries";
import { categories } from "@/lib/data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getAdminProduct(id);
  return { title: product?.name ?? "Product" };
}

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; created?: string }>;
}) {
  const { id } = await params;
  const { saved, created } = await searchParams;
  const product = await getAdminProduct(id);
  if (!product) notFound();

  const formData: ProductFormData = {
    id: product.id,
    name: product.name,
    subtitle: product.subtitle,
    categorySlug: product.categorySlug,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    fit: product.fit,
    status: product.status,
    description: product.description,
    details: product.details,
    sizes: product.sizes,
    badges: product.badges,
    colors: product.colors,
    images: [...product.images]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((i) => ({ url: i.url, thumb: i.thumb, alt: i.alt })),
    variants: product.variants.map((v) => ({
      color: v.color,
      size: v.size,
      stock: v.stock,
    })),
  };

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" /> Products
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl tracking-tight md:text-3xl">{product.name}</h1>
        <Link
          href={`/products/${product.slug}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          View on store <ExternalLink className="size-3.5" />
        </Link>
      </div>

      {(saved || created) && (
        <p className="border border-brand/30 bg-brand/5 px-4 py-3 text-sm text-brand">
          {created ? "Product created." : "Changes saved."}
        </p>
      )}

      <ProductForm
        categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
        product={formData}
      />
    </div>
  );
}
