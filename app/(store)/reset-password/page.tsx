import * as React from "react";
import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Choose a new password",
};

export default function ResetPassword() {
  return (
    <React.Suspense>
      <ResetPasswordForm />
    </React.Suspense>
  );
}
