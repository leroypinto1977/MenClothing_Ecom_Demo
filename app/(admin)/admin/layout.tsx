import type { Metadata } from "next";
import { AdminSidebar } from "@/components/admin/sidebar";
import { requireAdminArea } from "@/lib/admin/guard";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s — Meridian Admin" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminArea();

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[220px_1fr]">
      <div className="hidden md:block">
        <AdminSidebar
          userName={session.user.name}
          role={session.user.role ?? "staff"}
        />
      </div>
      <main className="min-w-0 bg-background px-5 py-8 md:px-8">{children}</main>
    </div>
  );
}
