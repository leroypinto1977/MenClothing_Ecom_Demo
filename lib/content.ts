import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { contentBlocks } from "@/lib/db/schema";

export interface HeroContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryCta: string;
  primaryHref: string;
  secondaryCta: string;
  secondaryHref: string;
}

export interface AnnouncementContent {
  messages: string[];
}

export const CONTENT_DEFAULTS = {
  "home.hero": {
    eyebrow: "Autumn / Winter 2026",
    title: "Modern essentials, refined.",
    subtitle:
      "Considered, well-made menswear designed to be worn season after season — crafted in Europe from natural fibres and built to last.",
    primaryCta: "Shop the collection",
    primaryHref: "/shop",
    secondaryCta: "Explore knitwear",
    secondaryHref: "/shop/knitwear",
  } satisfies HeroContent,
  announcement: {
    messages: [
      "Complimentary shipping on orders over ₹12,000",
      "Free 30-day returns — wear it, live in it, decide later",
      "New season knitwear has landed",
    ],
  } satisfies AnnouncementContent,
};

export type ContentKey = keyof typeof CONTENT_DEFAULTS;

/** Read an editorial block, merged over its defaults (so missing rows are safe). */
export async function getContent<K extends ContentKey>(
  key: K
): Promise<(typeof CONTENT_DEFAULTS)[K]> {
  const row = await db.query.contentBlocks.findFirst({
    where: eq(contentBlocks.key, key),
  });
  return {
    ...CONTENT_DEFAULTS[key],
    ...((row?.data as object | undefined) ?? {}),
  } as (typeof CONTENT_DEFAULTS)[K];
}

export async function setContent(
  key: ContentKey,
  data: object,
  updatedBy?: string
) {
  await db
    .insert(contentBlocks)
    .values({ key, data, updatedBy, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: contentBlocks.key,
      set: { data, updatedBy, updatedAt: new Date() },
    });
}
