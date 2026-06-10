"use client";

import { toast } from "sonner";
import { SiteButton } from "@/components/site-button";

export function WriteReviewButton() {
  return (
    <SiteButton
      variant="outline"
      size="md"
      className="mt-8 w-full"
      onClick={() => toast("Demo store — review submission is illustrative")}
    >
      Write a review
    </SiteButton>
  );
}
