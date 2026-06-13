"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Package, MapPin, Settings, LayoutGrid, Heart, LogOut } from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { Container } from "@/components/container";
import { SiteButton } from "@/components/site-button";
import { useWishlist } from "@/lib/store/wishlist-context";
import { formatPrice, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Order, User } from "@/lib/types";

const TABS = [
  { id: "overview", label: "Overview", Icon: LayoutGrid },
  { id: "orders", label: "Orders", Icon: Package },
  { id: "addresses", label: "Addresses", Icon: MapPin },
  { id: "settings", label: "Settings", Icon: Settings },
] as const;

const STATUS_STYLES: Record<string, string> = {
  Delivered: "bg-brand/10 text-brand",
  "In transit": "bg-foreground/10 text-foreground",
  Shipped: "bg-foreground/10 text-foreground",
  Processing: "bg-secondary text-muted-foreground",
  Cancelled: "bg-destructive/10 text-destructive",
  Refunded: "bg-secondary text-muted-foreground",
};

export function AccountView({
  user,
  orders,
}: {
  user: User;
  orders: Order[];
}) {
  const [tab, setTab] = React.useState<(typeof TABS)[number]["id"]>("overview");
  const wishlist = useWishlist();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <Container className="py-10 md:py-14">
      <div className="flex flex-col gap-1 border-b border-border pb-6">
        <p className="label-eyebrow text-brand">My Account</p>
        <div className="flex items-end justify-between">
          <h1 className="font-serif text-3xl tracking-tight md:text-4xl">
            Welcome back, {user.firstName}
          </h1>
          <button
            onClick={handleSignOut}
            className="hidden items-center gap-2 text-sm text-foreground/70 hover:text-foreground sm:inline-flex"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[220px_1fr] lg:gap-14">
        {/* Sidebar nav */}
        <aside>
          <nav className="flex gap-1 overflow-x-auto lg:flex-col">
            {TABS.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={cn(
                  "flex shrink-0 items-center gap-3 px-4 py-2.5 text-sm transition-colors lg:rounded-none",
                  tab === id
                    ? "bg-secondary font-medium text-foreground lg:border-l-2 lg:border-foreground"
                    : "text-foreground/70 hover:bg-secondary/60 hover:text-foreground"
                )}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Panel */}
        <div className="min-w-0">
          {tab === "overview" && (
            <Overview user={user} orders={orders} wishlistCount={wishlist.count} setTab={setTab} />
          )}
          {tab === "orders" && <Orders orders={orders} />}
          {tab === "addresses" && <Addresses user={user} />}
          {tab === "settings" && <SettingsPanel user={user} />}
        </div>
      </div>
    </Container>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border p-5">
      <p className="font-serif text-3xl">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}

function Overview({
  user,
  orders,
  wishlistCount,
  setTab,
}: {
  user: User;
  orders: Order[];
  wishlistCount: number;
  setTab: (t: "overview" | "orders" | "addresses" | "settings") => void;
}) {
  const recent = orders[0];
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatCard label="Orders" value={String(orders.length)} />
        <StatCard label="Wishlist" value={String(wishlistCount)} />
        <StatCard label="Member since" value={new Date(user.memberSince).getFullYear().toString()} />
      </div>

      {recent && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-serif text-xl">Most recent order</h2>
            <button
              onClick={() => setTab("orders")}
              className="text-xs uppercase tracking-[0.12em] text-foreground/70 hover:text-foreground"
            >
              View all
            </button>
          </div>
          <OrderCard order={recent} />
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <SiteButton href="/wishlist" variant="outline" size="md">
          <Heart className="size-4" /> View wishlist
        </SiteButton>
        <SiteButton href="/shop" size="md">
          Continue shopping
        </SiteButton>
      </div>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  return (
    <div className="border border-border">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-secondary/30 px-5 py-3.5">
        <div className="flex items-center gap-4 text-sm">
          <span className="font-medium">{order.id}</span>
          <span className="text-muted-foreground">{formatDate(order.date)}</span>
        </div>
        <div className="flex items-center gap-4">
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-medium",
              STATUS_STYLES[order.status]
            )}
          >
            {order.status}
          </span>
          <span className="text-sm font-medium tabular-nums">
            {formatPrice(order.total)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3 px-5 py-4">
        <div className="flex -space-x-3">
          {order.items.slice(0, 4).map((it) => (
            <div
              key={it.productId}
              className="relative size-14 overflow-hidden border border-background bg-muted"
            >
              <Image src={it.image} alt={it.name} fill sizes="56px" className="object-cover" />
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          {order.items.length} item{order.items.length > 1 ? "s" : ""}
          {order.tracking && (
            <>
              {" · "}
              <span className="text-foreground">Tracking {order.tracking}</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

function Orders({ orders }: { orders: Order[] }) {
  return (
    <div>
      <h2 className="mb-5 font-serif text-2xl">Order history</h2>
      <div className="space-y-4">
        {orders.map((o) => (
          <OrderCard key={o.id} order={o} />
        ))}
      </div>
    </div>
  );
}

function Addresses({ user }: { user: User }) {
  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-serif text-2xl">Saved addresses</h2>
        <SiteButton variant="outline" size="sm">
          Add new
        </SiteButton>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {user.addresses.map((a) => (
          <div key={a.id} className="border border-border p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{a.label}</p>
              {a.default && (
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs">
                  Default
                </span>
              )}
            </div>
            <address className="mt-3 text-sm not-italic leading-relaxed text-muted-foreground">
              {a.name}
              <br />
              {a.line1}
              {a.line2 && (
                <>
                  <br />
                  {a.line2}
                </>
              )}
              <br />
              {a.city}, {a.postal}
              <br />
              {a.country}
            </address>
            <div className="mt-4 flex gap-4 text-xs uppercase tracking-[0.1em]">
              <button className="text-foreground/70 hover:text-foreground">Edit</button>
              <button className="text-foreground/70 hover:text-foreground">Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsPanel({ user }: { user: User }) {
  return (
    <div className="max-w-lg">
      <h2 className="mb-5 font-serif text-2xl">Account settings</h2>
      <div className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-foreground/80">
            Full name
          </span>
          <input
            defaultValue={user.name}
            className="h-11 w-full border border-input bg-background px-3 text-sm outline-none focus-visible:border-foreground"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-foreground/80">
            Email
          </span>
          <input
            defaultValue={user.email}
            className="h-11 w-full border border-input bg-background px-3 text-sm outline-none focus-visible:border-foreground"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-foreground/80">
            Password
          </span>
          <input
            type="password"
            defaultValue="••••••••••"
            className="h-11 w-full border border-input bg-background px-3 text-sm outline-none focus-visible:border-foreground"
          />
        </label>
      </div>

      <div className="mt-6 space-y-3 border-t border-border pt-6">
        <p className="text-sm font-medium">Email preferences</p>
        {["New arrivals & editorials", "Order updates", "Early access to sales"].map(
          (p, i) => (
            <label key={p} className="flex items-center gap-3 text-sm">
              <input type="checkbox" defaultChecked={i !== 2} className="size-4 accent-[#8a6a47]" />
              {p}
            </label>
          )
        )}
      </div>

      <SiteButton size="md" className="mt-7">
        Save changes
      </SiteButton>
    </div>
  );
}
