"use client";

import * as React from "react";
import { toast } from "sonner";
import type { Product } from "@/lib/types";

const STORAGE_KEY = "meridian.wishlist.v1";

interface WishlistContextValue {
  ids: string[];
  hydrated: boolean;
  has: (id: string) => boolean;
  toggle: (product: Product) => void;
  remove: (id: string) => void;
  count: number;
}

const WishlistContext = React.createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = React.useState<string[]>([]);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setIds(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      /* ignore */
    }
  }, [ids, hydrated]);

  const has = React.useCallback((id: string) => ids.includes(id), [ids]);

  const toggle = React.useCallback((product: Product) => {
    setIds((prev) => {
      if (prev.includes(product.id)) {
        toast("Removed from wishlist", { description: product.name });
        return prev.filter((i) => i !== product.id);
      }
      toast.success("Saved to wishlist", { description: product.name });
      return [product.id, ...prev];
    });
  }, []);

  const remove = React.useCallback((id: string) => {
    setIds((prev) => prev.filter((i) => i !== id));
  }, []);

  const value: WishlistContextValue = {
    ids,
    hydrated,
    has,
    toggle,
    remove,
    count: ids.length,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = React.useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
