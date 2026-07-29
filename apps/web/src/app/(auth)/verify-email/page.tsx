import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { VerifyEmailForm } from "@/components/auth/verify-email-form";
import { redirectAuthenticatedUser } from "@/lib/auth/redirect-authenticated";

export const metadata: Metadata = {
  title: "Verify email · Multivrs",
  description: "Verify your email address to finish setting up Multivrs.",
};

export default async function VerifyEmailPage() {
  await redirectAuthenticatedUser({ allowUnverified: true });

  return (
    <AuthLayout>
      <Suspense fallback={null}>
        <VerifyEmailForm />
      </Suspense>
    </AuthLayout>
  );
}
