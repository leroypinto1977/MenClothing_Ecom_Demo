"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Container } from "@/components/container";
import { Field } from "@/components/form-field";
import { SiteButton } from "@/components/site-button";
import { forgetPassword } from "@/lib/auth-client";

export function ForgotPasswordForm() {
  const [pending, setPending] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pending) return;
    setPending(true);
    const email = String(new FormData(e.currentTarget).get("email") ?? "");
    const { error } = await forgetPassword({ email, redirectTo: "/reset-password" });
    setPending(false);
    if (error) {
      toast.error(error.message ?? "Something went wrong. Please try again.");
      return;
    }
    // Always show success to avoid leaking which emails are registered.
    setSent(true);
  };

  return (
    <Container className="flex min-h-[calc(100vh-9rem)] items-center justify-center py-14">
      <div className="w-full max-w-sm">
        <h1 className="font-serif text-3xl tracking-tight">Reset your password</h1>
        {sent ? (
          <p className="mt-3 text-sm text-muted-foreground">
            If an account exists for that email, we&apos;ve sent a link to reset your
            password. Please check your inbox.
          </p>
        ) : (
          <>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your email and we&apos;ll send you a link to set a new password.
            </p>
            <form onSubmit={submit} className="mt-8 space-y-4">
              <Field label="Email" name="email" type="email" required />
              <SiteButton size="block" className="mt-2" disabled={pending}>
                {pending ? "Sending…" : "Send reset link"}
              </SiteButton>
            </form>
          </>
        )}
        <p className="mt-8 text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </Container>
  );
}
