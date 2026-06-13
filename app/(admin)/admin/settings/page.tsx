import { SettingsForm } from "@/components/admin/settings-form";
import { requireAdmin } from "@/lib/admin/guard";
import { getStoreSettings } from "@/lib/settings";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requireAdmin();
  const settings = await getStoreSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl tracking-tight md:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Store profile and the shipping &amp; tax rules used at checkout.
        </p>
      </div>
      <SettingsForm settings={settings} />
    </div>
  );
}
