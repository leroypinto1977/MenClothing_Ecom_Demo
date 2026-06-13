import Link from "next/link";
import { Download, TrendingUp, TrendingDown } from "lucide-react";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { requireAdmin } from "@/lib/admin/guard";
import { getAnalytics, PERIODS, resolvePeriod } from "@/lib/admin/analytics";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = { title: "Analytics" };

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  await requireAdmin();
  const period = resolvePeriod((await searchParams).period);
  const a = await getAnalytics(period);

  const catTotal = a.byCategory.reduce((s, c) => s + c.revenue, 0) || 1;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl tracking-tight md:text-3xl">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">Revenue &amp; billing overview</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex border border-border text-sm">
            {(Object.keys(PERIODS) as (keyof typeof PERIODS)[]).map((k) => (
              <Link
                key={k}
                href={`/admin/analytics?period=${k}`}
                className={cn(
                  "px-3 py-2",
                  period === k ? "bg-foreground text-background" : "hover:bg-secondary"
                )}
              >
                {PERIODS[k].label}
              </Link>
            ))}
          </div>
          <Link
            href={`/admin/analytics/export?period=${period}`}
            className="inline-flex h-10 items-center gap-2 border border-border px-3 text-sm hover:bg-secondary"
          >
            <Download className="size-4" /> CSV
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Gross revenue" value={formatPrice(a.kpis.gross.value)} delta={a.kpis.gross.delta} />
        <Kpi label="Net revenue" value={formatPrice(a.kpis.net.value)} hint="after refunds" />
        <Kpi label="Orders" value={String(a.kpis.orders.value)} delta={a.kpis.orders.delta} />
        <Kpi label="Avg. order value" value={formatPrice(a.kpis.aov.value)} delta={a.kpis.aov.delta} />
        <Kpi label="Units sold" value={String(a.kpis.units.value)} delta={a.kpis.units.delta} />
        <Kpi label="GST collected" value={formatPrice(a.kpis.tax.value)} delta={a.kpis.tax.delta} hint="for filing" />
        <Kpi label="Refunds" value={formatPrice(a.kpis.refunds.value)} hint="this period" />
        <Kpi
          label="New / returning"
          value={`${a.customers.new} / ${a.customers.returning}`}
          hint="customers"
        />
      </div>

      {/* Revenue chart */}
      <section className="border border-border p-5">
        <h2 className="mb-4 font-serif text-xl">Revenue over time</h2>
        <RevenueChart data={a.series} />
      </section>

      {/* Category breakdown */}
      <section className="border border-border p-5">
        <h2 className="mb-4 font-serif text-xl">Revenue by category</h2>
        <div className="space-y-3">
          {a.byCategory.map((c) => (
            <div key={c.category}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="capitalize">{c.category}</span>
                <span className="tabular-nums text-muted-foreground">{formatPrice(c.revenue)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${Math.round((c.revenue / catTotal) * 100)}%` }}
                />
              </div>
            </div>
          ))}
          {a.byCategory.length === 0 && (
            <p className="text-sm text-muted-foreground">No sales in this period.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function Kpi({
  label,
  value,
  delta,
  hint,
}: {
  label: string;
  value: string;
  delta?: number | null;
  hint?: string;
}) {
  return (
    <div className="border border-border p-5">
      <p className="font-serif text-2xl tabular-nums">{value}</p>
      <div className="mt-1 flex items-center gap-2">
        <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
        {typeof delta === "number" && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs",
              delta >= 0 ? "text-brand" : "text-destructive"
            )}
          >
            {delta >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground/70">{hint}</p>}
    </div>
  );
}
