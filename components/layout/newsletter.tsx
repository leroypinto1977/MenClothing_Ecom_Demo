"use client";

import * as React from "react";
import { ArrowRight, Check } from "lucide-react";
import { Container } from "@/components/container";

export function Newsletter() {
  const [email, setEmail] = React.useState("");
  const [done, setDone] = React.useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setDone(true);
  };

  return (
    <div className="border-b border-border bg-secondary/40">
      <Container className="flex flex-col items-center gap-6 py-16 text-center md:py-20">
        <p className="label-eyebrow text-brand">The MERIDIAN List</p>
        <h2 className="max-w-2xl font-serif text-3xl leading-tight tracking-tight md:text-4xl">
          A quieter kind of newsletter — new arrivals, early access, and the
          occasional note on craft.
        </h2>

        {done ? (
          <p className="flex items-center gap-2 text-sm text-foreground">
            <Check className="size-4 text-brand" />
            Thank you — please check your inbox to confirm.
          </p>
        ) : (
          <form
            onSubmit={submit}
            className="flex w-full max-w-md items-center border-b border-foreground/30 focus-within:border-foreground"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              aria-label="Subscribe"
              className="flex size-10 items-center justify-center text-foreground transition-transform hover:translate-x-0.5"
            >
              <ArrowRight className="size-5" />
            </button>
          </form>
        )}
        <p className="text-xs text-muted-foreground">
          By subscribing you agree to our privacy policy. Unsubscribe anytime.
        </p>
      </Container>
    </div>
  );
}
