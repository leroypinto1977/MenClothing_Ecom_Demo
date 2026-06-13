"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq, notInArray } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  productImages,
  products,
  productVariants,
} from "@/lib/db/schema";
import { requireAdminArea } from "@/lib/admin/guard";
import { skuFor } from "@/lib/admin/sku";
import type { Badge, ColorOption, Fit } from "@/lib/types";

export interface ProductFormState {
  error?: string;
}

const FITS: Fit[] = ["Slim", "Regular", "Relaxed", "Tailored"];
const BADGES: Badge[] = ["new", "bestseller", "sale", "limited"];
const STATUSES = ["draft", "active", "archived"] as const;

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

interface ParsedImage {
  url: string;
  thumb: string;
  alt: string;
}

function parseForm(fd: FormData) {
  const name = String(fd.get("name") ?? "").trim();
  const subtitle = String(fd.get("subtitle") ?? "").trim();
  const categorySlug = String(fd.get("category") ?? "");
  const price = Math.round(Number(fd.get("price")));
  const compareAtRaw = String(fd.get("compareAtPrice") ?? "").trim();
  const compareAtPrice = compareAtRaw ? Math.round(Number(compareAtRaw)) : null;
  const fit = String(fd.get("fit") ?? "Regular") as Fit;
  const status = String(fd.get("status") ?? "active") as (typeof STATUSES)[number];
  const description = String(fd.get("description") ?? "").trim();
  const details = String(fd.get("details") ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const sizes = String(fd.get("sizes") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const badges = fd.getAll("badges").map(String) as Badge[];

  let colors: ColorOption[] = [];
  let images: ParsedImage[] = [];
  try {
    colors = JSON.parse(String(fd.get("colors") ?? "[]"));
    images = JSON.parse(String(fd.get("images") ?? "[]"));
  } catch {
    return { error: "Invalid colour or image data." } as const;
  }
  colors = colors.filter((c) => c.name?.trim() && c.hex?.trim());
  images = images.filter((i) => i.url?.trim());

  if (!name) return { error: "Name is required." } as const;
  if (!subtitle) return { error: "Subtitle is required." } as const;
  if (!categorySlug) return { error: "Category is required." } as const;
  if (!Number.isFinite(price) || price <= 0)
    return { error: "Price must be a positive number." } as const;
  if (compareAtPrice !== null && (!Number.isFinite(compareAtPrice) || compareAtPrice <= price))
    return { error: "Compare-at price must be higher than the price." } as const;
  if (!FITS.includes(fit)) return { error: "Invalid fit." } as const;
  if (!STATUSES.includes(status)) return { error: "Invalid status." } as const;
  if (badges.some((b) => !BADGES.includes(b)))
    return { error: "Invalid badge." } as const;
  if (sizes.length === 0) return { error: "At least one size is required." } as const;
  if (colors.length === 0) return { error: "At least one colour is required." } as const;
  if (images.length === 0) return { error: "At least one image is required." } as const;
  if (!description) return { error: "Description is required." } as const;

  return {
    value: {
      name,
      subtitle,
      categorySlug,
      price,
      compareAtPrice,
      fit,
      status,
      description,
      details,
      sizes,
      badges,
      colors,
      images: images.map((i) => ({
        url: i.url.trim(),
        thumb: (i.thumb || i.url).trim(),
        alt: (i.alt || name).trim(),
      })),
    },
  } as const;
}

/** Create variants for every colour×size combo; keep stock on survivors. */
async function syncVariants(
  productId: string,
  colors: ColorOption[],
  sizes: string[],
  fd: FormData
) {
  const combos = colors.flatMap((c) =>
    sizes.map((s) => ({ color: c.name, size: s, sku: skuFor(productId, c.name, s) }))
  );
  const skus = combos.map((c) => c.sku);

  await db
    .delete(productVariants)
    .where(
      and(
        eq(productVariants.productId, productId),
        skus.length > 0 ? notInArray(productVariants.sku, skus) : undefined
      )
    );

  const existing = await db.query.productVariants.findMany({
    where: eq(productVariants.productId, productId),
  });
  const existingBySku = new Map(existing.map((v) => [v.sku, v]));

  for (const combo of combos) {
    // Stock inputs are optional — named stock:<color>:<size>.
    const raw = fd.get(`stock:${combo.color}:${combo.size}`);
    const stock =
      raw === null || String(raw).trim() === ""
        ? undefined
        : Math.max(0, Math.round(Number(raw)) || 0);

    const current = existingBySku.get(combo.sku);
    if (!current) {
      await db.insert(productVariants).values({
        productId,
        color: combo.color,
        size: combo.size,
        sku: combo.sku,
        stock: stock ?? 0,
      });
    } else if (stock !== undefined && stock !== current.stock) {
      await db
        .update(productVariants)
        .set({ stock })
        .where(eq(productVariants.id, current.id));
    }
  }
}

async function replaceImages(productId: string, images: ParsedImage[]) {
  await db.delete(productImages).where(eq(productImages.productId, productId));
  await db.insert(productImages).values(
    images.map((img, i) => ({
      productId,
      url: img.url,
      thumb: img.thumb,
      alt: img.alt,
      sortOrder: i,
    }))
  );
}

function revalidateStorefront(slug?: string) {
  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
  revalidatePath("/");
  revalidatePath("/shop");
  if (slug) revalidatePath(`/products/${slug}`);
}

export async function saveProduct(
  _prev: ProductFormState,
  fd: FormData
): Promise<ProductFormState> {
  await requireAdminArea();

  const parsed = parseForm(fd);
  if ("error" in parsed) return { error: parsed.error };
  const data = parsed.value;

  const id = String(fd.get("id") ?? "").trim();

  if (id) {
    const current = await db.query.products.findFirst({
      where: eq(products.id, id),
    });
    if (!current) return { error: "Product not found." };

    await db
      .update(products)
      .set({
        name: data.name,
        subtitle: data.subtitle,
        categorySlug: data.categorySlug,
        price: data.price,
        compareAtPrice: data.compareAtPrice,
        fit: data.fit,
        status: data.status,
        description: data.description,
        details: data.details,
        sizes: data.sizes,
        badges: data.badges,
        colors: data.colors,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id));

    await replaceImages(id, data.images);
    await syncVariants(id, data.colors, data.sizes, fd);
    revalidateStorefront(current.slug);
    redirect(`/admin/products/${id}?saved=1`);
  }

  // New product: id pattern follows the seed ("<category>-<n>").
  const siblings = await db.query.products.findMany({
    columns: { id: true, slug: true },
  });
  let n = siblings.filter((p) => p.id.startsWith(`${data.categorySlug}-`)).length + 1;
  let newId = `${data.categorySlug}-${n}`;
  while (siblings.some((p) => p.id === newId)) newId = `${data.categorySlug}-${++n}`;

  let slug = slugify(data.name);
  let suffix = 2;
  while (siblings.some((p) => p.slug === slug)) slug = `${slugify(data.name)}-${suffix++}`;

  await db.insert(products).values({
    id: newId,
    slug,
    name: data.name,
    subtitle: data.subtitle,
    categorySlug: data.categorySlug,
    price: data.price,
    compareAtPrice: data.compareAtPrice,
    fit: data.fit,
    status: data.status,
    description: data.description,
    details: data.details,
    sizes: data.sizes,
    badges: data.badges,
    colors: data.colors,
    rating: 0,
    reviewCount: 0,
  });

  await replaceImages(newId, data.images);
  await syncVariants(newId, data.colors, data.sizes, fd);
  revalidateStorefront(slug);
  redirect(`/admin/products/${newId}?created=1`);
}

export async function setProductStatus(fd: FormData) {
  await requireAdminArea();
  const id = String(fd.get("id") ?? "");
  const status = String(fd.get("status") ?? "");
  if (!id || !STATUSES.includes(status as (typeof STATUSES)[number])) return;
  const row = await db.query.products.findFirst({ where: eq(products.id, id) });
  if (!row) return;
  await db
    .update(products)
    .set({ status: status as (typeof STATUSES)[number], updatedAt: new Date() })
    .where(eq(products.id, id));
  revalidateStorefront(row.slug);
}

export async function setVariantStock(fd: FormData) {
  await requireAdminArea();
  const variantId = Number(fd.get("variantId"));
  const stock = Math.max(0, Math.round(Number(fd.get("stock")) || 0));
  if (!Number.isFinite(variantId)) return;
  await db
    .update(productVariants)
    .set({ stock })
    .where(eq(productVariants.id, variantId));
  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
}
