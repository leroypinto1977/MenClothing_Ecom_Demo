import { CheckCircle2 } from "lucide-react";
import { Container } from "@/components/container";
import { StarRating } from "@/components/product/star-rating";
import { SiteButton } from "@/components/site-button";
import { formatDate } from "@/lib/format";
import type { Product, Review } from "@/lib/types";

export function ProductReviews({
  product,
  reviews,
}: {
  product: Product;
  reviews: Review[];
}) {
  // Plausible star distribution derived from the average.
  const dist = [5, 4, 3, 2, 1].map((star) => {
    const weight =
      star === Math.round(product.rating)
        ? 0.62
        : Math.abs(star - product.rating) < 1.2
          ? 0.22
          : 0.04;
    return { star, pct: Math.round(weight * 100) };
  });

  return (
    <section id="reviews" className="border-t border-border bg-secondary/30 py-16 md:py-20">
      <Container>
        <div className="grid gap-12 md:grid-cols-[320px_1fr] md:gap-16">
          {/* Summary */}
          <div className="md:sticky md:top-24 md:self-start">
            <p className="label-eyebrow text-brand">Reviews</p>
            <div className="mt-4 flex items-end gap-3">
              <span className="font-serif text-5xl leading-none">
                {product.rating.toFixed(1)}
              </span>
              <div className="pb-1">
                <StarRating rating={product.rating} size={16} />
                <p className="mt-1 text-xs text-muted-foreground">
                  Based on {product.reviewCount} reviews
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-1.5">
              {dist.map((d) => (
                <div key={d.star} className="flex items-center gap-2 text-xs">
                  <span className="w-3 text-muted-foreground">{d.star}</span>
                  <div className="h-1.5 flex-1 overflow-hidden bg-border">
                    <div
                      className="h-full bg-foreground/70"
                      style={{ width: `${d.pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-muted-foreground">
                    {d.pct}%
                  </span>
                </div>
              ))}
            </div>

            <SiteButton variant="outline" size="md" className="mt-8 w-full">
              Write a review
            </SiteButton>
          </div>

          {/* List */}
          <div className="divide-y divide-border">
            {reviews.map((r) => (
              <article key={r.id} className="py-6 first:pt-0">
                <div className="flex items-center justify-between gap-4">
                  <StarRating rating={r.rating} size={14} />
                  <time className="text-xs text-muted-foreground">
                    {formatDate(r.date)}
                  </time>
                </div>
                <h3 className="mt-3 font-medium">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {r.body}
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{r.author}</span>
                  <span>·</span>
                  <span>{r.location}</span>
                  {r.verified && (
                    <span className="ml-1 inline-flex items-center gap-1 text-brand">
                      <CheckCircle2 className="size-3.5" />
                      Verified buyer
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
