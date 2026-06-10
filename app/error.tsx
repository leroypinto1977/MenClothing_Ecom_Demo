"use client";

import * as React from "react";
import { Container } from "@/components/container";
import { SiteButton } from "@/components/site-button";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <p className="label-eyebrow text-brand">Something went wrong</p>
      <h1 className="mt-4 font-serif text-3xl tracking-tight md:text-4xl">
        We hit an unexpected snag.
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        Your bag and wishlist are safe. Try again, or head back to the
        collection while we look into it.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <SiteButton size="lg" onClick={() => unstable_retry()}>
          Try again
        </SiteButton>
        <SiteButton href="/" variant="outline" size="lg">
          Back to home
        </SiteButton>
      </div>
    </Container>
  );
}
