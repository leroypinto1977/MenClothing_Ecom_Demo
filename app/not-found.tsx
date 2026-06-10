import { Container } from "@/components/container";
import { SiteButton } from "@/components/site-button";

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="font-serif text-7xl tracking-tight text-brand md:text-8xl">404</p>
      <h1 className="mt-4 font-serif text-3xl tracking-tight md:text-4xl">
        This page has wandered off.
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
        Let&apos;s get you back to the good stuff.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <SiteButton href="/" size="lg">
          Back to home
        </SiteButton>
        <SiteButton href="/shop" variant="outline" size="lg">
          Shop the collection
        </SiteButton>
      </div>
    </Container>
  );
}
