"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { saveSettings, type SaveState } from "@/app/(admin)/admin/_actions/content";
import type { StoreSettings } from "@/lib/settings";

const labelCls = "mb-1.5 block text-xs font-medium text-foreground/80";
const inputCls =
  "h-10 w-full border border-input bg-background px-3 text-sm outline-none focus-visible:border-foreground";

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="inline-flex h-10 items-center bg-foreground px-5 text-sm font-medium text-background hover:bg-foreground/85 disabled:opacity-50"
    >
      {pending ? "Saving…" : "Save settings"}
    </button>
  );
}

export function SettingsForm({ settings }: { settings: StoreSettings }) {
  const [state, action] = useActionState<SaveState, FormData>(saveSettings, {});
  return (
    <form action={action} className="max-w-2xl space-y-8">
      <section className="space-y-4">
        <h2 className="font-serif text-lg">Store</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={labelCls}>Store name</span>
            <input name="storeName" defaultValue={settings.storeName} className={inputCls} required />
          </label>
          <label className="block">
            <span className={labelCls}>Support email</span>
            <input name="supportEmail" type="email" defaultValue={settings.supportEmail} className={inputCls} />
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-serif text-lg">Shipping &amp; tax</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={labelCls}>Free shipping over (₹)</span>
            <input name="freeShippingThreshold" type="number" min={0} defaultValue={settings.freeShippingThreshold} className={inputCls} />
          </label>
          <label className="block">
            <span className={labelCls}>Standard shipping (₹)</span>
            <input name="standardShipping" type="number" min={0} defaultValue={settings.standardShipping} className={inputCls} />
          </label>
          <label className="block">
            <span className={labelCls}>Express shipping (₹)</span>
            <input name="expressShipping" type="number" min={0} defaultValue={settings.expressShipping} className={inputCls} />
          </label>
          <label className="block">
            <span className={labelCls}>GST rate (%)</span>
            <input name="taxRatePct" type="number" min={0} step="0.1" defaultValue={settings.taxRatePct} className={inputCls} />
          </label>
        </div>
      </section>

      <div className="flex items-center gap-3 border-t border-border pt-6">
        <SaveButton />
        {state.error && <p className="text-sm text-destructive">{state.error}</p>}
        {state.ok && <p className="text-sm text-brand">Settings saved.</p>}
      </div>
    </form>
  );
}
