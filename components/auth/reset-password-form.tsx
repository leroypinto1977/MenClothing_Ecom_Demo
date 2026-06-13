"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Container } from "@/components/container";
import { Field } from "@/components/form-field";
import { SiteButton } from "@/components/site-button";
import { resetPassword } from "@/lib/auth-client";

export function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");
  const [pending, setPending] = React.useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pending || !token) return;
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") ?? "");
    const confirm = String(fd.get("confirm") ?? "");
    if (password !== confirm) {
      toast.error("Passwords don't match.");
      return;
    }
    setPending(true);
    const { error } = await resetPassword({ newPassword: password, token });
    setPending(false);
    if (error) {
      toast.error(error.message ?? "This reset link is invalid or has expired.");
      return;
    }
    toast.success("Password updated — please sign in.");
    router.push("/login");
  };

  return (
    <Container className="flex min-h-[calc(100vh-9rem)] items-center justify-center py-14">
      <div className="w-full max-w-sm">
        <h1 className="font-serif text-3xl tracking-tight">Choose a new password</h1>
        {!token ? (
          <p className="mt-3 text-sm text-muted-foreground">
            This reset link is missing or invalid.{" "}
            <Link href="/forgot-password" className="text-foreground underline-offset-4 hover:underline">
              Request a new one
            </Link>
            .
          </p>
        ) : (
          <form onSubmit={submit} className="mt-8 space-y-4">
            <Field label="New password" name="password" type="password" minLength={8} required />
            <Field label="Confirm password" name="confirm" type="password" minLength={8} required />
            <SiteButton size="block" className="mt-2" disabled={pending}>
              {pending ? "Updating…" : "Update password"}
            </SiteButton>
          </form>
        )}
      </div>
    </Container>
  );
}
