import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { desc, gte } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { auth, canAccessAdmin } from "@/lib/auth";
import { PERIODS, resolvePeriod } from "@/lib/admin/analytics";

function csvCell(v: unknown): string {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(request: NextRequest) {
  // Revenue export is admin-only.
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "admin") {
    return new NextResponse("Forbidden", { status: 403 });
  }
  if (!canAccessAdmin(session.user.role)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const period = resolvePeriod(request.nextUrl.searchParams.get("period") ?? undefined);
  const start = new Date();
  start.setDate(start.getDate() - PERIODS[period].days + 1);
  start.setHours(0, 0, 0, 0);

  const rows = await db.query.orders.findMany({
    where: gte(orders.placedAt, start),
    orderBy: [desc(orders.placedAt)],
  });

  const header = [
    "order_number",
    "placed_at",
    "status",
    "email",
    "subtotal",
    "shipping",
    "tax",
    "total",
    "currency",
    "carrier",
    "tracking_number",
  ];
  const lines = [header.join(",")];
  for (const o of rows) {
    lines.push(
      [
        o.number,
        o.placedAt.toISOString(),
        o.status,
        o.email,
        o.subtotal,
        o.shipping,
        o.tax,
        o.total,
        o.currency,
        o.carrier ?? "",
        o.trackingNumber ?? "",
      ]
        .map(csvCell)
        .join(",")
    );
  }

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="meridian-orders-${period}.csv"`,
    },
  });
}
