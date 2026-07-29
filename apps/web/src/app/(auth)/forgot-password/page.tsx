import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { redirectAuthenticatedUser } from "@/lib/auth/redirect-authenticated";

export const metadata: Metadata = {
  title: "Reset password · Multivrs",
  description: "Request a password reset link for your Multivrs account.",
};

export default async function ForgotPasswordPage() {
  await redirectAuthenticatedUser();

  return (
    <AuthLayout>
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
