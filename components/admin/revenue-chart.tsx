import { formatPrice } from "@/lib/format";

interface Point {
  day: string;
  revenue: number;
}

/** Server-rendered SVG bar chart — no client JS needed. */
export function RevenueChart({ data }: { data: Point[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
        No revenue in this period.
      </div>
    );
  }

  const W = 720;
  const H = 180;
  const pad = 4;
  const max = Math.max(...data.map((d) => d.revenue), 1);
  const barW = (W - pad * 2) / data.length;
  const peak = data.reduce((a, b) => (b.revenue > a.revenue ? b : a), data[0]);

  return (
    <div className="space-y-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Revenue over time">
        {data.map((d, i) => {
          const h = (d.revenue / max) * (H - 24);
          return (
            <rect
              key={d.day}
              x={pad + i * barW + barW * 0.12}
              y={H - h}
              width={barW * 0.76}
              height={h}
              rx={1}
              className="fill-brand"
            >
              <title>{`${d.day}: ${formatPrice(d.revenue)}`}</title>
            </rect>
          );
        })}
      </svg>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{data[0].day}</span>
        <span>Peak {formatPrice(peak.revenue)}</span>
        <span>{data[data.length - 1].day}</span>
      </div>
    </div>
  );
}
