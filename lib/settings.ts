import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { contentBlocks } from "@/lib/db/schema";

export interface StoreSettings {
  storeName: string;
  supportEmail: string;
  freeShippingThreshold: number;
  standardShipping: number;
  expressShipping: number;
  /** GST percentage, e.g. 8 for 8%. */
  taxRatePct: number;
}

export const SETTINGS_DEFAULTS: StoreSettings = {
  storeName: "MERIDIAN",
  supportEmail: "support@meridian.demo",
  freeShippingThreshold: 12000,
  standardShipping: 600,
  expressShipping: 1200,
  taxRatePct: 8,
};

const KEY = "settings";

export async function getStoreSettings(): Promise<StoreSettings> {
  const row = await db.query.contentBlocks.findFirst({
    where: eq(contentBlocks.key, KEY),
  });
  return { ...SETTINGS_DEFAULTS, ...((row?.data as object | undefined) ?? {}) };
}

export async function setStoreSettings(data: StoreSettings, updatedBy?: string) {
  await db
    .insert(contentBlocks)
    .values({ key: KEY, data, updatedBy, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: contentBlocks.key,
      set: { data, updatedBy, updatedAt: new Date() },
    });
}
