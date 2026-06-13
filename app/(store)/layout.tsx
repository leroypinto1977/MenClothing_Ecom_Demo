import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SearchOverlay } from "@/components/layout/search-overlay";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { getContent } from "@/lib/content";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const announcement = await getContent("announcement");
  return (
    <>
      <AnnouncementBar messages={announcement.messages} />
      <Header />
      <MobileNav />
      <SearchOverlay />
      <CartDrawer />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
