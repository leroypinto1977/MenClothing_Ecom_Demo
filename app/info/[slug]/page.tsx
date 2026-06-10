import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/container";
import { infoPages, getInfoPage } from "@/lib/data/info-pages";

export function generateStaticParams() {
  return infoPages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = getInfoPage(slug);
  if (!page) return { title: "Info" };
  return { title: page.title, description: page.description };
}

export default async function InfoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = getInfoPage(slug);
  if (!page) notFound();

  return (
    <Container className="py-14 md:py-20">
      <div className="mx-auto max-w-2xl">
        <nav className="mb-6 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="px-1.5">/</span>
          <span className="text-foreground">{page.title}</span>
        </nav>

        <p className="label-eyebrow text-brand">{page.eyebrow}</p>
        <h1 className="mt-3 font-serif text-3xl tracking-tight md:text-[2.5rem]">
          {page.title}
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          {page.intro}
        </p>

        <div className="mt-12 space-y-10">
          {page.sections.map((s) => (
            <section key={s.heading}>
              <h2 className="font-serif text-xl tracking-tight">{s.heading}</h2>
              {s.body?.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-3 text-sm leading-relaxed text-muted-foreground"
                >
                  {paragraph}
                </p>
              ))}
              {s.bullets && (
                <ul className="mt-3 space-y-2">
                  {s.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground"
                    >
                      <span className="text-brand">·</span>
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>

        <div className="mt-14 border-t border-border pt-8 text-sm text-muted-foreground">
          Can&apos;t find what you need?{" "}
          <Link
            href="/info/contact"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Contact us
          </Link>{" "}
          — we reply within one business day.
        </div>
      </div>
    </Container>
  );
}
