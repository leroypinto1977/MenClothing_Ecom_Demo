"use client";

import Link from "next/link";
import { Search, ChevronRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useUI } from "@/lib/store/ui-context";
import { categories } from "@/lib/data";

const SECONDARY = [
  { label: "New Arrivals", href: "/shop?sort=new" },
  { label: "Bestsellers", href: "/shop?filter=bestseller" },
  { label: "Sale", href: "/shop?filter=sale" },
  { label: "About", href: "/about" },
];

export function MobileNav() {
  const { mobileNavOpen, setMobileNavOpen, setSearchOpen } = useUI();
  const close = () => setMobileNavOpen(false);

  return (
    <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
      <SheetContent side="left" className="w-[88%] max-w-sm p-0">
        <SheetHeader className="border-b border-border p-5">
          <SheetTitle className="text-left text-sm font-semibold uppercase tracking-[0.3em]">
            Menu
          </SheetTitle>
        </SheetHeader>

        <div className="flex h-full flex-col overflow-y-auto">
          <button
            type="button"
            onClick={() => {
              close();
              setSearchOpen(true);
            }}
            className="flex items-center gap-3 border-b border-border px-5 py-4 text-sm text-muted-foreground"
          >
            <Search className="size-4" />
            Search the store
          </button>

          <nav className="px-1 py-2">
            <p className="px-4 pb-2 pt-3 label-eyebrow text-muted-foreground">
              Shop
            </p>
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/shop/${c.slug}`}
                onClick={close}
                className="flex items-center justify-between px-4 py-3 text-[0.95rem] text-foreground hover:bg-accent"
              >
                {c.name}
                <ChevronRight className="size-4 text-muted-foreground" />
              </Link>
            ))}

            <p className="px-4 pb-2 pt-5 label-eyebrow text-muted-foreground">
              Explore
            </p>
            {SECONDARY.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={close}
                className="flex items-center justify-between px-4 py-3 text-[0.95rem] text-foreground hover:bg-accent"
              >
                {l.label}
                <ChevronRight className="size-4 text-muted-foreground" />
              </Link>
            ))}
          </nav>

          <div className="mt-auto border-t border-border p-5 text-sm">
            <Link
              href="/account"
              onClick={close}
              className="block py-2 text-foreground/80 hover:text-foreground"
            >
              My Account
            </Link>
            <Link
              href="/wishlist"
              onClick={close}
              className="block py-2 text-foreground/80 hover:text-foreground"
            >
              Wishlist
            </Link>
            <Link
              href="/login"
              onClick={close}
              className="block py-2 text-foreground/80 hover:text-foreground"
            >
              Sign in
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
