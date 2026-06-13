import { Container } from "@/components/container";
import { SiteButton } from "@/components/site-button";

export default function Forbidden() {
  return (
    <Container className="flex flex-col items-center justify-center gap-5 py-28 text-center">
      <p className="label-eyebrow text-brand">403</p>
      <h1 className="font-serif text-3xl tracking-tight">No access</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        Your account doesn&apos;t have permission to view this page.
      </p>
      <SiteButton href="/" size="lg">
        Back to the store
      </SiteButton>
    </Container>
  );
}
