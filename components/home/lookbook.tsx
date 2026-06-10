import Image from "next/image";
import { SiteButton } from "@/components/site-button";
import { lifestyleImages } from "@/lib/data";

export function Lookbook() {
  const image = lifestyleImages[0]?.url ?? lifestyleImages[1]?.url;

  return (
    <section className="grid items-stretch md:grid-cols-2">
      <div className="relative aspect-[4/5] w-full md:aspect-auto md:min-h-[600px]">
        <Image
          src={image}
          alt="The Autumn Edit"
          fill
          sizes="(min-width:768px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-col justify-center bg-secondary/50 px-6 py-14 md:px-16 md:py-20">
        <div className="max-w-md">
          <p className="label-eyebrow text-brand">The Edit</p>
          <h2 className="mt-3 font-serif text-3xl leading-tight tracking-tight md:text-[2.75rem]">
            Layers for the turn of the season
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            A study in quiet warmth — brushed lambswool, double-faced wool and
            waxed cotton, in a palette drawn from the autumn landscape. Pieces
            made to be combined, and worn for years.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <SiteButton href="/shop?sort=new" size="lg">
              Shop the edit
            </SiteButton>
            <SiteButton href="/about" variant="outline" size="lg">
              Our story
            </SiteButton>
          </div>
        </div>
      </div>
    </section>
  );
}
