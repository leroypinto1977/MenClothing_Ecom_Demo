import { Container } from "@/components/container";
import { SiteButton } from "@/components/site-button";

export default function Unauthorized() {
  return (
    <Container className="flex flex-col items-center justify-center gap-5 py-28 text-center">
      <p className="label-eyebrow text-brand">401</p>
      <h1 className="font-serif text-3xl tracking-tight">Sign in required</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Please sign in to view this page.
      </p>
      <SiteButton href="/login" size="lg">
        Sign in
      </SiteButton>
    </Container>
  );
}
