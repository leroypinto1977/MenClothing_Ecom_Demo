import { headers } from "next/headers";
import { forbidden, unauthorized } from "next/navigation";
import { auth, canAccessAdmin } from "@/lib/auth";

/**
 * Gate for the /admin area: staff and admin roles.
 * The proxy only checks cookie presence — this is the authoritative check.
 * Call at the top of every admin page, layout, and server action.
 */
export async function requireAdminArea() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) unauthorized();
  if (!canAccessAdmin(session.user.role)) forbidden();
  return session;
}

/** Gate for admin-only surfaces (user management, refunds, revenue). */
export async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) unauthorized();
  if (session.user.role !== "admin") forbidden();
  return session;
}
