import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";
import { sendWelcome, sendPasswordReset } from "@/lib/notify";

export const auth = betterAuth({
  // baseURL is inferred from the request (dev port varies); set
  // BETTER_AUTH_URL in production.
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordReset(user.email, url, user.name);
    },
  },
  user: {
    additionalFields: {
      phone: { type: "string", required: false },
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await sendWelcome(user.email, user.name);
        },
      },
    },
  },
  plugins: [
    admin({
      defaultRole: "customer",
      adminRoles: ["admin"],
    }),
    // Must stay last so cookies set inside server actions are applied.
    nextCookies(),
  ],
});

export type ServerSession = typeof auth.$Infer.Session;

/** Roles allowed into the /admin area. Finer checks happen per action. */
export const ADMIN_AREA_ROLES = ["admin", "staff"] as const;

export function canAccessAdmin(role: string | null | undefined): boolean {
  return role === "admin" || role === "staff";
}
