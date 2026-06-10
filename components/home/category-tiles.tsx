import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/container";
import { SectionHeading } from "@/components/section-heading";
import { categories } from "@/lib/data";

export function CategoryTiles() {
  return (
    <section className="py-16 md:py-24">
      <Container>
        <SectionHeading
          eyebrow="The Wardrobe"
          title="Shop by category"
          href="/shop"
          cta="Shop all"
        />
        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/shop/${c.slug}`}
              className="group relative block overflow-hidden bg-muted"
            >
              <div className="relative aspect-[3/4] w-full">
                <Image
                  src={c.image}
                  alt={c.name}
                  fill
                  sizes="(min-width:768px) 33vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-background">
                <div>
                  <h3 className="font-serif text-xl md:text-2xl">{c.name}</h3>
                  <p className="mt-0.5 text-xs text-background/80">{c.tagline}</p>
                </div>
                <ArrowUpRight className="size-5 -translate-y-0.5 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100" />
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
