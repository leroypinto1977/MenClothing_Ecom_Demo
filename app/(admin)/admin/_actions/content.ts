"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { reviews } from "@/lib/db/schema";
import { requireAdminArea } from "@/lib/admin/guard";
import { setContent } from "@/lib/content";
import { setStoreSettings, SETTINGS_DEFAULTS } from "@/lib/settings";

export interface SaveState {
  ok?: boolean;
  error?: string;
}

export async function saveHero(_prev: SaveState, fd: FormData): Promise<SaveState> {
  const session = await requireAdminArea();
  const get = (k: string) => String(fd.get(k) ?? "").trim();
  const data = {
    eyebrow: get("eyebrow"),
    title: get("title"),
    subtitle: get("subtitle"),
    primaryCta: get("primaryCta"),
    primaryHref: get("primaryHref") || "/shop",
    secondaryCta: get("secondaryCta"),
    secondaryHref: get("secondaryHref") || "/shop",
  };
  if (!data.title) return { error: "Title is required." };
  await setContent("home.hero", data, session.user.id);
  revalidatePath("/");
  revalidatePath("/admin/content");
  return { ok: true };
}

export async function saveAnnouncement(
  _prev: SaveState,
  fd: FormData
): Promise<SaveState> {
  const session = await requireAdminArea();
  const messages = String(fd.get("messages") ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  if (messages.length === 0) return { error: "Add at least one message." };
  await setContent("announcement", { messages }, session.user.id);
  revalidatePath("/", "layout");
  revalidatePath("/admin/content");
  return { ok: true };
}

export async function saveSettings(
  _prev: SaveState,
  fd: FormData
): Promise<SaveState> {
  const session = await requireAdminArea();
  const num = (k: string, fallback: number) => {
    const v = Number(fd.get(k));
    return Number.isFinite(v) && v >= 0 ? v : fallback;
  };
  const storeName = String(fd.get("storeName") ?? "").trim();
  const supportEmail = String(fd.get("supportEmail") ?? "").trim();
  if (!storeName) return { error: "Store name is required." };

  await setStoreSettings(
    {
      storeName,
      supportEmail: supportEmail || SETTINGS_DEFAULTS.supportEmail,
      freeShippingThreshold: num("freeShippingThreshold", SETTINGS_DEFAULTS.freeShippingThreshold),
      standardShipping: num("standardShipping", SETTINGS_DEFAULTS.standardShipping),
      expressShipping: num("expressShipping", SETTINGS_DEFAULTS.expressShipping),
      taxRatePct: num("taxRatePct", SETTINGS_DEFAULTS.taxRatePct),
    },
    session.user.id
  );
  revalidatePath("/admin/settings");
  revalidatePath("/checkout");
  return { ok: true };
}

// --- Reviews moderation -----------------------------------------------------

export async function setReviewStatus(fd: FormData) {
  await requireAdminArea();
  const id = String(fd.get("id") ?? "");
  const status = String(fd.get("status") ?? "");
  if (!id || !["pending", "published", "rejected"].includes(status)) return;

  const review = await db.query.reviews.findFirst({
    where: eq(reviews.id, id),
    columns: { productId: true },
  });
  await db
    .update(reviews)
    .set({ status: status as "pending" | "published" | "rejected" })
    .where(eq(reviews.id, id));

  revalidatePath("/admin/reviews");
  if (review) {
    const product = await db.query.products.findFirst({
      where: (p, { eq: e }) => e(p.id, review.productId),
      columns: { slug: true },
    });
    if (product) revalidatePath(`/products/${product.slug}`);
  }
}
