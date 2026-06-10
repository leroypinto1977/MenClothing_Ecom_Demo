"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, Search, ShoppingBag, Heart, User } from "lucide-react";
import { Wordmark } from "@/components/brand/wordmark";
import { Container } from "@/components/container";
import { mainNav, type NavItem } from "@/lib/nav";
import { useCart } from "@/lib/store/cart-context";
import { useWishlist } from "@/lib/store/wishlist-context";
import { useUI } from "@/lib/store/ui-context";
import { cn } from "@/lib/utils";

export function Header() {
  const [scrolled, setScrolled] = React.useState(false);
  const [activeMenu, setActiveMenu] = React.useState<string | null>(null);
  const { count, openCart } = useCart();
  const wishlist = useWishlist();
  const { setSearchOpen, setMobileNavOpen } = useUI();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const active = mainNav.find((n) => n.label === activeMenu && n.columns);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 transition-shadow",
        scrolled ? "border-b border-border shadow-[0_1px_0_rgba(0,0,0,0.02)]" : "border-b border-transparent"
      )}
      onMouseLeave={() => setActiveMenu(null)}
      onKeyDown={(e) => {
        if (e.key === "Escape") setActiveMenu(null);
      }}
      onBlur={(e) => {
        // Close the mega menu when keyboard focus leaves the header.
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setActiveMenu(null);
        }
      }}
    >
      <Container>
        <div
          className={cn(
            "grid grid-cols-[1fr_auto_1fr] items-center transition-[height] duration-300",
            scrolled ? "h-14" : "h-16 md:h-[4.5rem]"
          )}
        >
          {/* Left — desktop nav / mobile menu button */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="lg:hidden -ml-2 inline-flex size-10 items-center justify-center text-foreground"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </button>
            <nav className="hidden lg:flex items-center gap-7">
              {mainNav.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onMouseEnter={() => setActiveMenu(item.label)}
                  onFocus={() => setActiveMenu(item.label)}
                  className={cn(
                    "relative py-2 text-[0.8rem] font-medium uppercase tracking-[0.12em] transition-colors",
                    item.accent
                      ? "text-brand hover:text-brand"
                      : "text-foreground/80 hover:text-foreground",
                    activeMenu === item.label && "text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Center — wordmark */}
          <div className="flex justify-center">
            <Wordmark
              className={cn("transition-all", scrolled ? "text-lg" : "text-xl")}
            />
          </div>

          {/* Right — actions */}
          <div className="flex items-center justify-end gap-0.5 md:gap-1">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="inline-flex size-10 items-center justify-center text-foreground/80 hover:text-foreground"
              aria-label="Search"
            >
              <Search className="size-[1.15rem]" />
            </button>
            <Link
              href="/account"
              className="hidden sm:inline-flex size-10 items-center justify-center text-foreground/80 hover:text-foreground"
              aria-label="Account"
            >
              <User className="size-[1.15rem]" />
            </Link>
            <Link
              href="/wishlist"
              className="relative inline-flex size-10 items-center justify-center text-foreground/80 hover:text-foreground"
              aria-label="Wishlist"
            >
              <Heart className="size-[1.15rem]" />
              {wishlist.count > 0 && (
                <span className="absolute right-1 top-1.5 inline-flex min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[0.6rem] font-semibold leading-4 text-brand-foreground">
                  {wishlist.count}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={openCart}
              className="relative inline-flex size-10 items-center justify-center text-foreground/80 hover:text-foreground"
              aria-label={`Bag (${count})`}
            >
              <ShoppingBag className="size-[1.15rem]" />
              {count > 0 && (
                <span className="absolute right-1 top-1.5 inline-flex min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[0.6rem] font-semibold leading-4 text-background">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </Container>

      {/* Mega menu panel */}
      <MegaMenu item={active ?? null} />
    </header>
  );
}

function MegaMenu({ item }: { item: NavItem | null }) {
  return (
    <div
      className={cn(
        "absolute inset-x-0 top-full hidden overflow-hidden border-b border-border bg-background lg:block",
        item ? "max-h-[460px] opacity-100" : "pointer-events-none max-h-0 opacity-0"
      )}
      style={{ transition: "max-height 320ms ease, opacity 220ms ease" }}
    >
      {item && (
        <Container className="grid grid-cols-[1fr_1fr_1fr_1.2fr] gap-10 py-10">
          {item.columns?.map((col) => (
            <div key={col.heading}>
              <p className="label-eyebrow text-muted-foreground">{col.heading}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-[0.95rem] text-foreground/75 transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {item.featured && (
            <Link href={item.featured.href} className="group relative block">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                <Image
                  src={item.featured.image}
                  alt={item.featured.label}
                  fill
                  sizes="360px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
                <div className="absolute bottom-0 p-5 text-background">
                  <p className="font-serif text-lg leading-tight">
                    {item.featured.label}
                  </p>
                  <p className="mt-1 text-xs text-background/80">
                    {item.featured.caption}
                  </p>
                </div>
              </div>
            </Link>
          )}
        </Container>
      )}
    </div>
  );
}
