import type { Metadata } from "next";
import { AccountView } from "@/components/account/account-view";
import { currentUser, orders } from "@/lib/data";

export const metadata: Metadata = {
  title: "My Account",
};

export default function Account() {
  return <AccountView user={currentUser} orders={orders} />;
}
