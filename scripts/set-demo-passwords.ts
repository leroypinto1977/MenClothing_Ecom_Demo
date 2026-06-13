/**
 * Attaches credential accounts (Better Auth "credential" provider) to the
 * seeded demo users so they can sign in:
 *   james.whitfield@example.com / meridian
 *   admin@meridian.demo         / meridian-admin
 *
 * Run with: npx tsx scripts/set-demo-passwords.ts
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";
import * as schema from "../lib/db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const DEMO_ACCOUNTS = [
  { userId: "user-james", password: "meridian" },
  { userId: "user-admin", password: "meridian-admin" },
];

async function main() {
  for (const { userId, password } of DEMO_ACCOUNTS) {
    const hash = await hashPassword(password);
    await db
      .delete(schema.accounts)
      .where(eq(schema.accounts.userId, userId));
    await db.insert(schema.accounts).values({
      id: `acc-${userId}`,
      accountId: userId,
      providerId: "credential",
      userId,
      password: hash,
    });
    console.log(`Credential set for ${userId}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
