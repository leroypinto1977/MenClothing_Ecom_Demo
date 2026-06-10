import { Container } from "@/components/container";
import { SiteButton } from "@/components/site-button";

const PILLARS = [
  {
    title: "Natural materials",
    body: "Extra-fine merino, organic cotton and full-grain leather — fibres chosen to feel good and age beautifully.",
  },
  {
    title: "Considered craft",
    body: "Made in small European workshops by people who have spent a lifetime perfecting a single craft.",
  },
  {
    title: "Made to last",
    body: "Designed to outlive trends and seasons. Fewer, better things — repaired, not replaced.",
  },
];

export function BrandStory() {
  return (
    <section className="bg-foreground text-background">
      <Container className="py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <p className="label-eyebrow text-background/60">Our philosophy</p>
          <h2 className="mt-4 font-serif text-3xl leading-tight tracking-tight md:text-[2.75rem]">
            We believe in fewer, better things — bought once and worn for years.
          </h2>
        </div>

        <div className="mt-16 grid gap-10 md:grid-cols-3 md:gap-14">
          {PILLARS.map((p, i) => (
            <div key={p.title} className="text-center md:text-left">
              <p className="font-serif text-2xl text-background/40">
                0{i + 1}
              </p>
              <h3 className="mt-3 text-sm font-semibold uppercase tracking-[0.14em]">
                {p.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-background/70">
                {p.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 flex justify-center">
          <SiteButton href="/about" variant="light" size="lg">
            Read our story
          </SiteButton>
        </div>
      </Container>
    </section>
  );
}
