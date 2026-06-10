import type { Metadata } from "next";
import Image from "next/image";
import { Container } from "@/components/container";
import { SiteButton } from "@/components/site-button";
import { heroImages, lifestyleImages } from "@/lib/data";

export const metadata: Metadata = {
  title: "Our Story",
  description:
    "MERIDIAN crafts considered, well-made menswear essentials — designed in London, made in Europe, built to last.",
};

const PILLARS = [
  {
    title: "Materials first",
    body: "We start with the fibre. Extra-fine merino, organic long-staple cotton, full-grain leather — natural materials chosen to feel good against the skin and improve with age.",
  },
  {
    title: "Made by specialists",
    body: "Our pieces are made in small, family-run workshops across Portugal, Italy and Scotland, by people who have spent a lifetime perfecting a single craft.",
  },
  {
    title: "Built to last",
    body: "We design against the seasonal churn of fashion. Considered, versatile pieces meant to be repaired, re-worn, and kept for years — not replaced.",
  },
];

const STATS = [
  { value: "2019", label: "Founded in London" },
  { value: "12", label: "Partner workshops" },
  { value: "94%", label: "Natural fibres" },
  { value: "30k+", label: "Considered wardrobes" },
];

export default function About() {
  return (
    <>
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[440px] w-full overflow-hidden">
        <Image
          src={heroImages[2]?.url ?? heroImages[0].url}
          alt="MERIDIAN"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <Container className="relative flex h-full flex-col items-center justify-center text-center text-background">
          <p className="label-eyebrow text-background/80">Our Story</p>
          <h1 className="mt-4 max-w-2xl font-serif text-4xl leading-tight tracking-tight md:text-6xl">
            Modern essentials, made to last.
          </h1>
        </Container>
      </section>

      {/* Lead */}
      <Container className="py-16 text-center md:py-24">
        <p className="mx-auto max-w-3xl font-serif text-2xl leading-relaxed tracking-tight md:text-[2rem] md:leading-[1.4]">
          MERIDIAN began with a simple frustration — that good, honest menswear
          had become surprisingly hard to find. So we set out to make the
          essentials we wanted to wear: quietly refined, properly made, and
          designed to last.
        </p>
      </Container>

      {/* Split */}
      <section className="grid items-stretch md:grid-cols-2">
        <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[560px]">
          <Image
            src={lifestyleImages[1]?.url ?? lifestyleImages[0].url}
            alt="Craft"
            fill
            sizes="(min-width:768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="flex items-center bg-secondary/40 px-6 py-14 md:px-16">
          <div className="max-w-md">
            <p className="label-eyebrow text-brand">The approach</p>
            <h2 className="mt-3 font-serif text-3xl leading-tight tracking-tight md:text-4xl">
              A wardrobe built on intention
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              We believe in fewer, better things. Every piece in the collection
              earns its place — versatile enough to wear a dozen ways, and made
              well enough to still be in rotation years from now. No seasonal
              noise, no compromise on the things that matter.
            </p>
            <SiteButton href="/shop" size="lg" className="mt-8">
              Explore the collection
            </SiteButton>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <Container className="py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-3 md:gap-14">
          {PILLARS.map((p, i) => (
            <div key={p.title}>
              <p className="font-serif text-3xl text-brand/50">0{i + 1}</p>
              <h3 className="mt-3 font-serif text-xl">{p.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </Container>

      {/* Stats */}
      <section className="bg-foreground text-background">
        <Container className="grid grid-cols-2 gap-10 py-16 md:grid-cols-4 md:py-20">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-serif text-4xl md:text-5xl">{s.value}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.14em] text-background/60">
                {s.label}
              </p>
            </div>
          ))}
        </Container>
      </section>

      {/* CTA */}
      <Container className="py-20 text-center md:py-28">
        <h2 className="mx-auto max-w-2xl font-serif text-3xl leading-tight tracking-tight md:text-[2.5rem]">
          Considered pieces, for a wardrobe that lasts.
        </h2>
        <div className="mt-8 flex justify-center gap-3">
          <SiteButton href="/shop" size="lg">
            Shop the collection
          </SiteButton>
          <SiteButton href="/shop/knitwear" variant="outline" size="lg">
            New in knitwear
          </SiteButton>
        </div>
      </Container>
    </>
  );
}
