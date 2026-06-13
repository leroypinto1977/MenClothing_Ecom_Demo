import Link from "next/link";
import { Star } from "lucide-react";
import { getReviewsForModeration, getReviewCounts } from "@/lib/admin/queries";
import { setReviewStatus } from "@/app/(admin)/admin/_actions/content";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata = { title: "Reviews" };

const STATUS_STYLES: Record<string, string> = {
  published: "bg-brand/10 text-brand",
  pending: "bg-foreground/10 text-foreground",
  rejected: "bg-destructive/10 text-destructive",
};

export default async function ReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const [list, counts] = await Promise.all([
    getReviewsForModeration(status),
    getReviewCounts(),
  ]);

  const total = Object.values(counts).reduce((s, n) => s + n, 0);
  const tabs = [
    { key: undefined, label: "All", count: total },
    { key: "pending", label: "Pending", count: counts.pending ?? 0 },
    { key: "published", label: "Published", count: counts.published ?? 0 },
    { key: "rejected", label: "Rejected", count: counts.rejected ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl tracking-tight md:text-3xl">Reviews</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Only published reviews appear on the storefront.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {tabs.map((t) => (
          <Link
            key={t.label}
            href={`/admin/reviews${t.key ? `?status=${t.key}` : ""}`}
            className={cn(
              "inline-flex items-center gap-1.5 border px-3 py-1.5 text-xs transition-colors",
              (status ?? undefined) === t.key
                ? "border-foreground bg-foreground text-background"
                : "border-border hover:bg-secondary"
            )}
          >
            {t.label}
            <span className="tabular-nums opacity-70">{t.count}</span>
          </Link>
        ))}
      </div>

      <div className="space-y-3">
        {list.map((r) => (
          <div key={r.id} className="border border-border p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-0.5 text-brand">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn("size-3.5", i < r.rating ? "fill-current" : "opacity-25")}
                      />
                    ))}
                  </span>
                  <span className="text-sm font-medium">{r.title}</span>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                      STATUS_STYLES[r.status]
                    )}
                  >
                    {r.status}
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-muted-foreground">{r.body}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {r.author} · {formatDate(r.date)} ·{" "}
                  <Link href={`/admin/products/${r.productId}`} className="hover:underline">
                    {r.productName}
                  </Link>
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                {r.status !== "published" && (
                  <StatusButton id={r.id} to="published" label="Publish" />
                )}
                {r.status !== "rejected" && (
                  <StatusButton id={r.id} to="rejected" label="Reject" />
                )}
              </div>
            </div>
          </div>
        ))}
        {list.length === 0 && (
          <p className="border border-border p-10 text-center text-sm text-muted-foreground">
            No reviews here.
          </p>
        )}
      </div>
    </div>
  );
}

function StatusButton({ id, to, label }: { id: string; to: string; label: string }) {
  return (
    <form action={setReviewStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={to} />
      <button
        className={cn(
          "h-9 border px-3 text-xs transition-colors",
          to === "published"
            ? "border-foreground hover:bg-foreground hover:text-background"
            : "border-border text-muted-foreground hover:text-destructive"
        )}
      >
        {label}
      </button>
    </form>
  );
}
