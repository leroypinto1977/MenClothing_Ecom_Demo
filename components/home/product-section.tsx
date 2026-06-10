import { Container } from "@/components/container";
import { SectionHeading } from "@/components/section-heading";
import { ProductGrid } from "@/components/product/product-grid";
import { cn } from "@/lib/utils";
import type { Product } from "@/lib/types";

export function ProductSection({
  eyebrow,
  title,
  description,
  href,
  cta,
  products,
  priority = false,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  cta?: string;
  products: Product[];
  priority?: boolean;
  className?: string;
}) {
  return (
    <section className={cn("py-14 md:py-20", className)}>
      <Container>
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          description={description}
          href={href}
          cta={cta}
        />
        <ProductGrid
          products={products}
          className="mt-10"
          priorityCount={priority ? 4 : 0}
        />
      </Container>
    </section>
  );
}
