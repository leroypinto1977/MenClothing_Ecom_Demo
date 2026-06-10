"use client";

import * as React from "react";
import { SlidersHorizontal, X, Check } from "lucide-react";
import { Container } from "@/components/container";
import { ProductGrid } from "@/components/product/product-grid";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { categories } from "@/lib/data";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36", "38", "One Size"];

const PRICE_BANDS = [
  { id: "u6000", label: "Under ₹6,000", test: (p: Product) => p.price < 6000 },
  { id: "6-12k", label: "₹6,000 – ₹12,000", test: (p: Product) => p.price >= 6000 && p.price < 12000 },
  { id: "12-24k", label: "₹12,000 – ₹24,000", test: (p: Product) => p.price >= 12000 && p.price < 24000 },
  { id: "24k+", label: "₹24,000 & above", test: (p: Product) => p.price >= 24000 },
];

const SORTS = [
  { id: "featured", label: "Featured" },
  { id: "newest", label: "Newest" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "rating", label: "Top Rated" },
];

interface Filters {
  categories: string[];
  sizes: string[];
  colors: string[];
  price: string[];
  fits: string[];
  onSale: boolean;
}

const EMPTY: Filters = {
  categories: [],
  sizes: [],
  colors: [],
  price: [],
  fits: [],
  onSale: false,
};

export function ShopView({
  products,
  title,
  description,
  lockedCategory = false,
  initialSort = "featured",
  initialOnSale = false,
}: {
  products: Product[];
  title: string;
  description?: string;
  lockedCategory?: boolean;
  initialSort?: string;
  initialOnSale?: boolean;
}) {
  const [filters, setFilters] = React.useState<Filters>({
    ...EMPTY,
    onSale: initialOnSale,
  });
  const [sort, setSort] = React.useState(initialSort);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Derive available options from the product set.
  const options = React.useMemo(() => {
    const sizes = new Set<string>();
    const fits = new Set<string>();
    const colorMap = new Map<string, string>();
    for (const p of products) {
      p.sizes.forEach((s) => sizes.add(s));
      fits.add(p.fit);
      p.colors.forEach((c) => colorMap.set(c.name, c.hex));
    }
    return {
      sizes: [...sizes].sort(
        (a, b) => SIZE_ORDER.indexOf(a) - SIZE_ORDER.indexOf(b)
      ),
      fits: [...fits].sort(),
      colors: [...colorMap.entries()].map(([name, hex]) => ({ name, hex })),
    };
  }, [products]);

  const filtered = React.useMemo(() => {
    let list = products.filter((p) => {
      if (filters.categories.length && !filters.categories.includes(p.category))
        return false;
      if (filters.sizes.length && !p.sizes.some((s) => filters.sizes.includes(s)))
        return false;
      if (
        filters.colors.length &&
        !p.colors.some((c) => filters.colors.includes(c.name))
      )
        return false;
      if (filters.fits.length && !filters.fits.includes(p.fit)) return false;
      if (filters.onSale && !p.compareAtPrice) return false;
      if (filters.price.length) {
        const bands = PRICE_BANDS.filter((b) => filters.price.includes(b.id));
        if (!bands.some((b) => b.test(p))) return false;
      }
      return true;
    });

    list = [...list];
    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        list.sort(
          (a, b) =>
            Number(b.badges.includes("new")) - Number(a.badges.includes("new"))
        );
        break;
    }
    return list;
  }, [products, filters, sort]);

  const toggle = (key: keyof Omit<Filters, "onSale">, value: string) =>
    setFilters((f) => ({
      ...f,
      [key]: f[key].includes(value)
        ? (f[key] as string[]).filter((v) => v !== value)
        : [...(f[key] as string[]), value],
    }));

  const activeCount =
    filters.categories.length +
    filters.sizes.length +
    filters.colors.length +
    filters.price.length +
    filters.fits.length +
    (filters.onSale ? 1 : 0);

  const clearAll = () => setFilters({ ...EMPTY });

  const panel = (
    <FilterPanel
      filters={filters}
      options={options}
      lockedCategory={lockedCategory}
      onToggle={toggle}
      onToggleSale={() => setFilters((f) => ({ ...f, onSale: !f.onSale }))}
    />
  );

  return (
    <Container className="py-8 md:py-12">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <nav className="mb-4 text-xs text-muted-foreground">
          <span>Home</span> <span className="px-1">/</span>{" "}
          <span className="text-foreground">{title}</span>
        </nav>
        <h1 className="font-serif text-3xl tracking-tight md:text-[2.5rem]">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      {/* Toolbar */}
      <div className="sticky top-14 z-20 -mx-5 mb-8 flex items-center justify-between gap-4 border-b border-border bg-background/95 px-5 py-3 backdrop-blur md:top-[4.5rem] md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="inline-flex items-center gap-2 text-sm font-medium"
        >
          <SlidersHorizontal className="size-4" />
          Filters {activeCount > 0 && <span className="text-brand">({activeCount})</span>}
        </button>
        <SortControl value={sort} onChange={setSort} />
      </div>

      <div className="flex gap-10">
        {/* Sidebar */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-[5.5rem]">{panel}</div>
        </aside>

        {/* Main */}
        <div className="min-w-0 flex-1">
          <div className="mb-6 hidden items-center justify-between md:flex">
            <p className="text-sm text-muted-foreground">
              {filtered.length} {filtered.length === 1 ? "item" : "items"}
            </p>
            <SortControl value={sort} onChange={setSort} />
          </div>

          {activeCount > 0 && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {[
                ...filters.categories.map((v) => ["categories", v] as const),
                ...filters.sizes.map((v) => ["sizes", v] as const),
                ...filters.colors.map((v) => ["colors", v] as const),
                ...filters.fits.map((v) => ["fits", v] as const),
                ...filters.price.map((v) => [
                  "price",
                  PRICE_BANDS.find((b) => b.id === v)?.label ?? v,
                ] as const),
              ].map(([key, label]) => (
                <button
                  key={`${key}-${label}`}
                  onClick={() =>
                    key === "price"
                      ? toggle("price", PRICE_BANDS.find((b) => b.label === label)?.id ?? label)
                      : toggle(key as keyof Omit<Filters, "onSale">, label)
                  }
                  className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs"
                >
                  {label} <X className="size-3" />
                </button>
              ))}
              {filters.onSale && (
                <button
                  onClick={() => setFilters((f) => ({ ...f, onSale: false }))}
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs text-brand"
                >
                  On sale <X className="size-3" />
                </button>
              )}
              <button
                onClick={clearAll}
                className="text-xs uppercase tracking-[0.12em] text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Clear all
              </button>
            </div>
          )}

          {filtered.length > 0 ? (
            <ProductGrid products={filtered} priorityCount={4} />
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="font-serif text-xl">No pieces match these filters</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try removing a filter to see more.
              </p>
              <button
                onClick={clearAll}
                className="mt-5 text-xs uppercase tracking-[0.14em] underline underline-offset-4"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[88%] max-w-sm overflow-y-auto">
          <SheetHeader className="px-0">
            <SheetTitle className="text-sm font-semibold uppercase tracking-[0.2em]">
              Filters
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4">{panel}</div>
          <div className="sticky bottom-0 -mx-4 mt-6 border-t border-border bg-background px-4 py-4">
            <button
              onClick={() => setMobileOpen(false)}
              className="h-11 w-full bg-foreground text-xs font-medium uppercase tracking-[0.14em] text-background"
            >
              Show {filtered.length} results
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </Container>
  );
}

function SortControl({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">Sort by</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none border border-border bg-transparent py-2 pl-3 pr-9 text-sm outline-none focus-visible:border-foreground"
      >
        {SORTS.map((s) => (
          <option key={s.id} value={s.id}>
            Sort: {s.label}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-3 size-4 text-muted-foreground"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </label>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border py-5">
      <p className="label-eyebrow mb-3 text-muted-foreground">{title}</p>
      {children}
    </div>
  );
}

function FilterPanel({
  filters,
  options,
  lockedCategory,
  onToggle,
  onToggleSale,
}: {
  filters: Filters;
  options: {
    sizes: string[];
    fits: string[];
    colors: { name: string; hex: string }[];
  };
  lockedCategory: boolean;
  onToggle: (key: keyof Omit<Filters, "onSale">, value: string) => void;
  onToggleSale: () => void;
}) {
  return (
    <div>
      {!lockedCategory && (
        <FilterGroup title="Category">
          <ul className="space-y-2">
            {categories.map((c) => (
              <li key={c.slug}>
                <CheckRow
                  label={c.name}
                  checked={filters.categories.includes(c.slug)}
                  onClick={() => onToggle("categories", c.slug)}
                />
              </li>
            ))}
          </ul>
        </FilterGroup>
      )}

      <FilterGroup title="Size">
        <div className="flex flex-wrap gap-2">
          {options.sizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onToggle("sizes", s)}
              className={cn(
                "min-w-9 border px-2.5 py-1.5 text-xs transition-colors",
                filters.sizes.includes(s)
                  ? "border-foreground bg-foreground text-background"
                  : "border-border hover:border-foreground"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Colour">
        <div className="flex flex-wrap gap-2.5">
          {options.colors.map((c) => (
            <button
              key={c.name}
              type="button"
              title={c.name}
              aria-label={c.name}
              onClick={() => onToggle("colors", c.name)}
              className={cn(
                "relative size-7 rounded-full ring-offset-2 ring-offset-background transition-all",
                filters.colors.includes(c.name)
                  ? "ring-2 ring-foreground"
                  : "ring-1 ring-border hover:ring-foreground/50"
              )}
              style={{ backgroundColor: c.hex }}
            >
              {filters.colors.includes(c.name) && (
                <Check
                  className="absolute inset-0 m-auto size-3.5"
                  style={{ color: isLight(c.hex) ? "#000" : "#fff" }}
                />
              )}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Price">
        <ul className="space-y-2">
          {PRICE_BANDS.map((b) => (
            <li key={b.id}>
              <CheckRow
                label={b.label}
                checked={filters.price.includes(b.id)}
                onClick={() => onToggle("price", b.id)}
              />
            </li>
          ))}
        </ul>
      </FilterGroup>

      <FilterGroup title="Fit">
        <ul className="space-y-2">
          {options.fits.map((f) => (
            <li key={f}>
              <CheckRow
                label={f}
                checked={filters.fits.includes(f)}
                onClick={() => onToggle("fits", f)}
              />
            </li>
          ))}
        </ul>
      </FilterGroup>

      <div className="py-5">
        <CheckRow
          label="On sale only"
          checked={filters.onSale}
          onClick={onToggleSale}
        />
      </div>
    </div>
  );
}

function CheckRow({
  label,
  checked,
  onClick,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 text-left text-sm text-foreground/80 transition-colors hover:text-foreground"
    >
      <span
        className={cn(
          "flex size-4 shrink-0 items-center justify-center border transition-colors",
          checked ? "border-foreground bg-foreground text-background" : "border-input"
        )}
      >
        {checked && <Check className="size-3" />}
      </span>
      {label}
    </button>
  );
}

function isLight(hex: string) {
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 150;
}
