"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Container } from "@/components/container";
import { Field } from "@/components/form-field";
import { SiteButton } from "@/components/site-button";
import { lifestyleImages } from "@/lib/data";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const isLogin = mode === "login";
  const image = lifestyleImages[3]?.url ?? lifestyleImages[0]?.url;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(isLogin ? "Welcome back" : "Account created", {
      description: "Demo store — you're signed in as James.",
    });
    router.push("/account");
  };

  return (
    <div className="grid min-h-[calc(100vh-9rem)] lg:grid-cols-2">
      {/* Editorial panel */}
      <div className="relative hidden lg:block">
        <Image
          src={image}
          alt="MERIDIAN"
          fill
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-black/30" />
        <div className="absolute inset-0 flex flex-col justify-between p-12 text-background">
          <p className="font-sans text-lg font-semibold uppercase tracking-[0.34em]">
            Meridian
          </p>
          <div>
            <p className="max-w-sm font-serif text-2xl leading-snug">
              “Fewer, better things — bought once and worn for years.”
            </p>
            <p className="mt-3 text-sm text-background/70">The MERIDIAN philosophy</p>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center py-14">
        <Container className="max-w-md">
          <div className="mx-auto w-full max-w-sm">
            <h1 className="font-serif text-3xl tracking-tight">
              {isLogin ? "Sign in" : "Create account"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {isLogin
                ? "Welcome back. Sign in to continue."
                : "Join MERIDIAN for early access and faster checkout."}
            </p>

            <form onSubmit={submit} className="mt-8 space-y-4">
              {!isLogin && (
                <div className="grid grid-cols-2 gap-3">
                  <Field label="First name" defaultValue="James" required />
                  <Field label="Last name" defaultValue="Whitfield" required />
                </div>
              )}
              <Field
                label="Email"
                type="email"
                defaultValue="james.whitfield@example.com"
                required
              />
              <div>
                <Field label="Password" type="password" defaultValue="meridian" required />
                {isLogin && (
                  <div className="mt-2 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        toast("Demo store — password reset is illustrative", {
                          description: "Use any credentials to sign in.",
                        })
                      }
                      className="text-xs text-foreground/70 underline-offset-4 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}
              </div>
              {!isLogin && (
                <label className="flex items-start gap-2.5 text-xs text-muted-foreground">
                  <input type="checkbox" required className="mt-0.5 size-4 accent-[#8a6a47]" />
                  I agree to the Terms of Service and Privacy Policy.
                </label>
              )}

              <SiteButton size="block" className="mt-2">
                {isLogin ? "Sign in" : "Create account"}
              </SiteButton>
            </form>

            <div className="my-6 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
            </div>
            <div className="space-y-3">
              {["Continue with Apple", "Continue with Google"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => toast("Demo store — social sign-in is illustrative")}
                  className="h-11 w-full border border-border text-sm font-medium transition-colors hover:bg-secondary"
                >
                  {p}
                </button>
              ))}
            </div>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              {isLogin ? "New to MERIDIAN? " : "Already have an account? "}
              <Link
                href={isLogin ? "/register" : "/login"}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                {isLogin ? "Create an account" : "Sign in"}
              </Link>
            </p>
          </div>
        </Container>
      </div>
    </div>
  );
}
