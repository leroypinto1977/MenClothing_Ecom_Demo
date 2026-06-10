import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Sign In",
};

export default function Login() {
  return <AuthForm mode="login" />;
}
