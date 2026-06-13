import Image from "next/image";
import { Container } from "@/components/container";
import { SiteButton } from "@/components/site-button";
import { heroImages } from "@/lib/data";
import type { HeroContent } from "@/lib/content";

export function Hero({ content }: { content: HeroContent }) {
  // Street portrait (hero bucket 13) — camel coat on an autumn walk; the
  // garden portrait (11) is the fallback. Crop tuned via object-position so
  // the subject stays clear of the left-aligned copy at every breakpoint.
  const image = heroImages[13]?.url ?? heroImages[11]?.url;

  return (
    <section className="relative">
      <div className="relative h-[82vh] min-h-[560px] w-full overflow-hidden">
        <Image
          src={image}
          alt="MERIDIAN Autumn / Winter collection"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[38%_32%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        <Container className="relative flex h-full flex-col justify-end pb-16 md:justify-center md:pb-0">
          <div className="max-w-xl text-background animate-fade-up">
            <p className="label-eyebrow text-background/80">{content.eyebrow}</p>
            <h1 className="mt-4 font-serif text-[2.75rem] leading-[1.03] tracking-tight md:text-6xl">
              {content.title}
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-background/85">
              {content.subtitle}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <SiteButton href={content.primaryHref} variant="light" size="lg">
                {content.primaryCta}
              </SiteButton>
              <SiteButton
                href={content.secondaryHref}
                variant="outlineLight"
                size="lg"
              >
                {content.secondaryCta}
              </SiteButton>
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
}
