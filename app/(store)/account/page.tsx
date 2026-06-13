import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AccountView } from "@/components/account/account-view";
import { auth } from "@/lib/auth";
import { getAddressesForUser, getOrdersForUser } from "@/lib/db/queries";

export const metadata: Metadata = {
  title: "My Account",
};

export default async function Account() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login?next=/account");

  const [orders, addresses] = await Promise.all([
    getOrdersForUser(session.user.id),
    getAddressesForUser(session.user.id),
  ]);

  const user = {
    name: session.user.name,
    firstName: session.user.name.split(" ")[0] ?? session.user.name,
    email: session.user.email,
    memberSince: session.user.createdAt.toISOString().slice(0, 10),
    addresses,
  };

  return <AccountView user={user} orders={orders} />;
}
