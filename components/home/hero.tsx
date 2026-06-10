import Image from "next/image";
import { Container } from "@/components/container";
import { SiteButton } from "@/components/site-button";
import { heroImages } from "@/lib/data";

export function Hero() {
  const image = heroImages[0]?.url ?? heroImages[1]?.url;

  return (
    <section className="relative">
      <div className="relative h-[82vh] min-h-[560px] w-full overflow-hidden">
        <Image
          src={image}
          alt="MERIDIAN Autumn / Winter collection"
          fill
          priority
          sizes="100vw"
          className="object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        <Container className="relative flex h-full flex-col justify-end pb-16 md:justify-center md:pb-0">
          <div className="max-w-xl text-background animate-fade-up">
            <p className="label-eyebrow text-background/80">
              Autumn / Winter 2026
            </p>
            <h1 className="mt-4 font-serif text-[2.75rem] leading-[1.03] tracking-tight md:text-6xl">
              Modern essentials, refined.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-background/85">
              Considered, well-made menswear designed to be worn season after
              season — crafted in Europe from natural fibres and built to last.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <SiteButton href="/shop" variant="light" size="lg">
                Shop the collection
              </SiteButton>
              <SiteButton href="/shop/knitwear" variant="outlineLight" size="lg">
                Explore knitwear
              </SiteButton>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
