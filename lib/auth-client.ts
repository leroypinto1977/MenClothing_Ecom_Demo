"use client";

import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  plugins: [adminClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;

// Better Auth infers these from server endpoints; the inferred client type is
// too large to destructure cleanly, so wrap them with thin typed shims.
type AuthResult = { error?: { message?: string } | null };
interface PasswordResetClient {
  requestPasswordReset: (opts: {
    email: string;
    redirectTo?: string;
  }) => Promise<AuthResult>;
  resetPassword: (opts: {
    newPassword: string;
    token: string;
  }) => Promise<AuthResult>;
}
const pwClient = authClient as unknown as PasswordResetClient;

export function forgetPassword(opts: { email: string; redirectTo?: string }) {
  return pwClient.requestPasswordReset(opts);
}
export function resetPassword(opts: { newPassword: string; token: string }) {
  return pwClient.resetPassword(opts);
}
