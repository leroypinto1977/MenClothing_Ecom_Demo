"use client";

import * as React from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Plus, Trash2 } from "lucide-react";
import {
  saveProduct,
  type ProductFormState,
} from "@/app/(admin)/admin/_actions/products";
import { cn } from "@/lib/utils";
import type { Badge, ColorOption, Fit } from "@/lib/types";

const FITS: Fit[] = ["Slim", "Regular", "Relaxed", "Tailored"];
const BADGES: Badge[] = ["new", "bestseller", "sale", "limited"];
const STATUSES = ["draft", "active", "archived"] as const;

export interface ProductFormData {
  id?: string;
  name: string;
  subtitle: string;
  categorySlug: string;
  price: number;
  compareAtPrice: number | null;
  fit: Fit;
  status: (typeof STATUSES)[number];
  description: string;
  details: string[];
  sizes: string[];
  badges: Badge[];
  colors: ColorOption[];
  images: { url: string; thumb: string; alt: string }[];
  variants: { color: string; size: string; stock: number }[];
}

const labelCls = "mb-1.5 block text-xs font-medium text-foreground/80";
const inputCls =
  "h-10 w-full border border-input bg-background px-3 text-sm outline-none focus-visible:border-foreground";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center bg-foreground px-7 text-sm font-medium text-background transition-colors hover:bg-foreground/85 disabled:opacity-50"
    >
      {pending ? "Saving…" : "Save product"}
    </button>
  );
}

export function ProductForm({
  categories,
  product,
}: {
  categories: { slug: string; name: string }[];
  product?: ProductFormData;
}) {
  const [state, formAction] = useActionState<ProductFormState, FormData>(
    saveProduct,
    {}
  );

  const [colors, setColors] = React.useState<ColorOption[]>(
    product?.colors ?? [{ name: "", hex: "#000000" }]
  );
  const [sizesInput, setSizesInput] = React.useState(
    product?.sizes.join(", ") ?? "S, M, L, XL"
  );
  const [images, setImages] = React.useState(
    product?.images ?? [{ url: "", thumb: "", alt: "" }]
  );

  const sizes = sizesInput
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const stockBySku = React.useMemo(() => {
    const m = new Map<string, number>();
    for (const v of product?.variants ?? []) m.set(`${v.color}:${v.size}`, v.stock);
    return m;
  }, [product]);

  const validColors = colors.filter((c) => c.name.trim());

  return (
    <form action={formAction} className="space-y-8">
      {product?.id && <input type="hidden" name="id" value={product.id} />}
      <input type="hidden" name="colors" value={JSON.stringify(colors)} />
      <input type="hidden" name="images" value={JSON.stringify(images)} />
      <input type="hidden" name="sizes" value={sizesInput} />

      {state.error && (
        <p className="border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {state.error}
        </p>
      )}

      {/* Basics */}
      <section className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className={labelCls}>Name</span>
          <input name="name" defaultValue={product?.name} className={inputCls} required />
        </label>
        <label className="block sm:col-span-2">
          <span className={labelCls}>Subtitle</span>
          <input name="subtitle" defaultValue={product?.subtitle} className={inputCls} required />
        </label>
        <label className="block">
          <span className={labelCls}>Category</span>
          <select name="category" defaultValue={product?.categorySlug} className={inputCls} required>
            <option value="">Select…</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={labelCls}>Fit</span>
          <select name="fit" defaultValue={product?.fit ?? "Regular"} className={inputCls}>
            {FITS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={labelCls}>Price (₹)</span>
          <input
            name="price"
            type="number"
            min={1}
            defaultValue={product?.price}
            className={inputCls}
            required
          />
        </label>
        <label className="block">
          <span className={labelCls}>Compare-at price (₹, optional)</span>
          <input
            name="compareAtPrice"
            type="number"
            min={1}
            defaultValue={product?.compareAtPrice ?? undefined}
            className={inputCls}
          />
        </label>
      </section>

      {/* Status + badges */}
      <section className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={labelCls}>Status</span>
          <select name="status" defaultValue={product?.status ?? "active"} className={inputCls}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <div>
          <span className={labelCls}>Badges</span>
          <div className="flex flex-wrap gap-3 pt-2">
            {BADGES.map((b) => (
              <label key={b} className="flex items-center gap-2 text-sm capitalize">
                <input
                  type="checkbox"
                  name="badges"
                  value={b}
                  defaultChecked={product?.badges.includes(b)}
                  className="size-4 accent-[#8a6a47]"
                />
                {b}
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="space-y-4">
        <label className="block">
          <span className={labelCls}>Description</span>
          <textarea
            name="description"
            defaultValue={product?.description}
            rows={4}
            className={cn(inputCls, "h-auto py-2")}
            required
          />
        </label>
        <label className="block">
          <span className={labelCls}>Details (one per line)</span>
          <textarea
            name="details"
            defaultValue={product?.details.join("\n")}
            rows={4}
            className={cn(inputCls, "h-auto py-2")}
          />
        </label>
      </section>

      {/* Sizes */}
      <section>
        <label className="block max-w-md">
          <span className={labelCls}>Sizes (comma-separated)</span>
          <input
            value={sizesInput}
            onChange={(e) => setSizesInput(e.target.value)}
            className={inputCls}
          />
        </label>
      </section>

      {/* Colors */}
      <section>
        <p className={labelCls}>Colours</p>
        <div className="space-y-2">
          {colors.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="color"
                value={c.hex}
                onChange={(e) =>
                  setColors((prev) =>
                    prev.map((x, j) => (j === i ? { ...x, hex: e.target.value } : x))
                  )
                }
                className="size-10 shrink-0 cursor-pointer border border-input bg-background"
              />
              <input
                value={c.name}
                placeholder="Colour name"
                onChange={(e) =>
                  setColors((prev) =>
                    prev.map((x, j) => (j === i ? { ...x, name: e.target.value } : x))
                  )
                }
                className={cn(inputCls, "max-w-xs")}
              />
              <button
                type="button"
                onClick={() => setColors((prev) => prev.filter((_, j) => j !== i))}
                className="text-muted-foreground hover:text-destructive"
                aria-label="Remove colour"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setColors((prev) => [...prev, { name: "", hex: "#000000" }])}
          className="mt-2 inline-flex items-center gap-1.5 text-sm text-foreground/70 hover:text-foreground"
        >
          <Plus className="size-4" /> Add colour
        </button>
      </section>

      {/* Images */}
      <section>
        <p className={labelCls}>Images</p>
        <div className="space-y-2">
          {images.map((img, i) => (
            <div key={i} className="flex items-center gap-2">
              {img.url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img.thumb || img.url} alt="" className="size-10 shrink-0 object-cover" />
              )}
              <input
                value={img.url}
                placeholder="Image URL"
                onChange={(e) =>
                  setImages((prev) =>
                    prev.map((x, j) =>
                      j === i ? { ...x, url: e.target.value, thumb: x.thumb || e.target.value } : x
                    )
                  )
                }
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                className="text-muted-foreground hover:text-destructive"
                aria-label="Remove image"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setImages((prev) => [...prev, { url: "", thumb: "", alt: "" }])}
          className="mt-2 inline-flex items-center gap-1.5 text-sm text-foreground/70 hover:text-foreground"
        >
          <Plus className="size-4" /> Add image
        </button>
      </section>

      {/* Variant stock matrix */}
      {validColors.length > 0 && sizes.length > 0 && (
        <section>
          <p className={labelCls}>Stock by variant</p>
          <div className="overflow-x-auto border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/30 text-left text-xs uppercase tracking-[0.1em] text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Colour</th>
                  {sizes.map((s) => (
                    <th key={s} className="px-3 py-2 text-center font-medium">
                      {s}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {validColors.map((c) => (
                  <tr key={c.name} className="border-b border-border last:border-0">
                    <td className="whitespace-nowrap px-3 py-2 font-medium">{c.name}</td>
                    {sizes.map((s) => (
                      <td key={s} className="px-2 py-1.5 text-center">
                        <input
                          type="number"
                          min={0}
                          name={`stock:${c.name}:${s}`}
                          defaultValue={stockBySku.get(`${c.name}:${s}`) ?? 0}
                          className="h-9 w-16 border border-input bg-background px-2 text-center text-sm outline-none focus-visible:border-foreground"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            A size shows as sold out on the storefront when every colour for it is at zero.
          </p>
        </section>
      )}

      <div className="border-t border-border pt-6">
        <SubmitButton />
      </div>
    </form>
  );
}
