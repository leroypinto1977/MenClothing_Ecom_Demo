import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/container";
import { SectionHeading } from "@/components/section-heading";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductDetail } from "@/components/product/product-detail";
import { ProductReviews } from "@/components/product/product-reviews";
import {
  getProductBySlug,
  getRelatedProducts,
  getProductReviews,
} from "@/lib/db/queries";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product" };
  return {
    title: product.name,
    description: product.subtitle,
    openGraph: { images: [product.images[0].url] },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [related, reviews] = await Promise.all([
    getRelatedProducts(product),
    getProductReviews(product),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((i) => i.url),
    brand: { "@type": "Brand", name: SITE_NAME },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/products/${product.slug}`,
      price: product.price,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetail product={product} />
      <ProductReviews product={product} reviews={reviews} />

      {related.length > 0 && (
        <section className="py-16 md:py-20">
          <Container>
            <SectionHeading
              eyebrow="Complete the look"
              title="You may also like"
              href={`/shop/${product.category}`}
              cta={`More ${product.category}`}
            />
            <ProductGrid products={related} className="mt-10" />
          </Container>
        </section>
      )}
    </>
  );
}
