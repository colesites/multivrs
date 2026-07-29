import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { redirectAuthenticatedUser } from "@/lib/auth/redirect-authenticated";

export const metadata: Metadata = {
  title: "New password · Multivrs",
  description: "Set a new password for your Multivrs account.",
};

export default async function ResetPasswordPage() {
  await redirectAuthenticatedUser();

  return (
    <AuthLayout>
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
