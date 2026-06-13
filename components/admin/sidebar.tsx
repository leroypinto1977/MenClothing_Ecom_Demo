"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Boxes,
  LogOut,
  Store,
} from "lucide-react";
import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", Icon: Package },
  { href: "/admin/inventory", label: "Inventory", Icon: Boxes },
];

export function AdminSidebar({
  userName,
  role,
}: {
  userName: string;
  role: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="flex h-full flex-col border-r border-border bg-secondary/20">
      <div className="border-b border-border px-5 py-5">
        <Link href="/admin" className="font-serif text-lg tracking-tight">
          MERIDIAN
        </Link>
        <p className="mt-0.5 text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
          Admin
        </p>
      </div>

      <nav className="flex-1 space-y-0.5 p-3">
        {NAV.map(({ href, label, Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-foreground text-background"
                  : "text-foreground/70 hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-border p-4">
        <div className="text-sm">
          <p className="font-medium">{userName}</p>
          <p className="text-xs capitalize text-muted-foreground">{role}</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-foreground/70">
          <Link href="/" className="inline-flex items-center gap-1.5 hover:text-foreground">
            <Store className="size-3.5" /> View store
          </Link>
          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 hover:text-foreground"
          >
            <LogOut className="size-3.5" /> Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
