"use client";

import * as React from "react";
import { setVariantStock } from "@/app/(admin)/admin/_actions/products";
import { cn } from "@/lib/utils";

export function StockInput({
  variantId,
  stock,
}: {
  variantId: number;
  stock: number;
}) {
  const [value, setValue] = React.useState(String(stock));
  const [saved, setSaved] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  const commit = () => {
    const next = Math.max(0, Math.round(Number(value)) || 0);
    setValue(String(next));
    if (next === stock) return;
    const fd = new FormData();
    fd.set("variantId", String(variantId));
    fd.set("stock", String(next));
    startTransition(async () => {
      await setVariantStock(fd);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    });
  };

  return (
    <input
      type="number"
      min={0}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
      disabled={pending}
      className={cn(
        "h-9 w-20 border bg-background px-2 text-center text-sm outline-none focus-visible:border-foreground",
        saved ? "border-brand" : "border-input",
        Number(value) === 0 && "text-destructive"
      )}
    />
  );
}
