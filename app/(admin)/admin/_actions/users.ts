"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/admin/guard";

const ROLES = ["customer", "staff", "admin"] as const;

export async function setUserRole(fd: FormData) {
  const session = await requireAdmin();
  const id = String(fd.get("id") ?? "");
  const role = String(fd.get("role") ?? "");
  if (!id || !ROLES.includes(role as (typeof ROLES)[number])) return;
  // Don't let an admin strip their own admin rights (lockout guard).
  if (id === session.user.id && role !== "admin") return;

  await db
    .update(users)
    .set({ role: role as (typeof ROLES)[number], updatedAt: new Date() })
    .where(eq(users.id, id));
  revalidatePath("/admin/users");
}

export async function setUserBanned(fd: FormData) {
  const session = await requireAdmin();
  const id = String(fd.get("id") ?? "");
  const banned = String(fd.get("banned") ?? "") === "true";
  if (!id || id === session.user.id) return; // can't ban yourself

  await db
    .update(users)
    .set({
      banned,
      banReason: banned ? "Disabled by admin" : null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, id));
  revalidatePath("/admin/users");
  revalidatePath(`/admin/customers/${id}`);
}
