"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import {
  saveHero,
  saveAnnouncement,
  type SaveState,
} from "@/app/(admin)/admin/_actions/content";
import type { HeroContent, AnnouncementContent } from "@/lib/content";

const labelCls = "mb-1.5 block text-xs font-medium text-foreground/80";
const inputCls =
  "h-10 w-full border border-input bg-background px-3 text-sm outline-none focus-visible:border-foreground";

function SaveButton({ label = "Save" }: { label?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="inline-flex h-10 items-center bg-foreground px-5 text-sm font-medium text-background hover:bg-foreground/85 disabled:opacity-50"
    >
      {pending ? "Saving…" : label}
    </button>
  );
}

function Status({ state }: { state: SaveState }) {
  if (state.error)
    return <p className="text-sm text-destructive">{state.error}</p>;
  if (state.ok) return <p className="text-sm text-brand">Saved.</p>;
  return null;
}

export function HeroForm({ content }: { content: HeroContent }) {
  const [state, action] = useActionState<SaveState, FormData>(saveHero, {});
  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={labelCls}>Eyebrow</span>
          <input name="eyebrow" defaultValue={content.eyebrow} className={inputCls} />
        </label>
        <label className="block">
          <span className={labelCls}>Title</span>
          <input name="title" defaultValue={content.title} className={inputCls} required />
        </label>
      </div>
      <label className="block">
        <span className={labelCls}>Subtitle</span>
        <textarea
          name="subtitle"
          defaultValue={content.subtitle}
          rows={2}
          className={inputCls + " h-auto py-2"}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className={labelCls}>Primary button label</span>
          <input name="primaryCta" defaultValue={content.primaryCta} className={inputCls} />
        </label>
        <label className="block">
          <span className={labelCls}>Primary button link</span>
          <input name="primaryHref" defaultValue={content.primaryHref} className={inputCls} />
        </label>
        <label className="block">
          <span className={labelCls}>Secondary button label</span>
          <input name="secondaryCta" defaultValue={content.secondaryCta} className={inputCls} />
        </label>
        <label className="block">
          <span className={labelCls}>Secondary button link</span>
          <input name="secondaryHref" defaultValue={content.secondaryHref} className={inputCls} />
        </label>
      </div>
      <div className="flex items-center gap-3">
        <SaveButton />
        <Status state={state} />
      </div>
    </form>
  );
}

export function AnnouncementForm({ content }: { content: AnnouncementContent }) {
  const [state, action] = useActionState<SaveState, FormData>(saveAnnouncement, {});
  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className={labelCls}>Messages (one per line; they rotate)</span>
        <textarea
          name="messages"
          defaultValue={content.messages.join("\n")}
          rows={4}
          className={inputCls + " h-auto py-2"}
        />
      </label>
      <div className="flex items-center gap-3">
        <SaveButton />
        <Status state={state} />
      </div>
    </form>
  );
}
