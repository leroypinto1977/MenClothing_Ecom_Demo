import { HeroForm, AnnouncementForm } from "@/components/admin/content-forms";
import { requireAdminArea } from "@/lib/admin/guard";
import { getContent } from "@/lib/content";

export const metadata = { title: "Content" };

export default async function ContentPage() {
  await requireAdminArea();
  const [hero, announcement] = await Promise.all([
    getContent("home.hero"),
    getContent("announcement"),
  ]);

  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="font-serif text-2xl tracking-tight md:text-3xl">Content</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Editorial copy shown across the storefront.
        </p>
      </div>

      <section className="border border-border p-5">
        <h2 className="mb-4 font-serif text-xl">Homepage hero</h2>
        <HeroForm content={hero} />
      </section>

      <section className="border border-border p-5">
        <h2 className="mb-4 font-serif text-xl">Announcement bar</h2>
        <AnnouncementForm content={announcement} />
      </section>
    </div>
  );
}
