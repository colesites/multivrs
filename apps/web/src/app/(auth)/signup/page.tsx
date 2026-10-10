import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { redirectAuthenticatedUser } from "@/lib/auth/redirect-authenticated";
import { normalizeAuthReturnPath } from "@/lib/auth/return-path";

export const metadata: Metadata = {
  title: "Create account · Multivrs",
  description: "Create your Multivrs account.",
};

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  await redirectAuthenticatedUser();

  return (
    <AuthLayout>
      <Suspense fallback={null}>
        <SignupForm searchParams={searchParams} />
      </Suspense>
    </AuthLayout>
  );
}

async function SignupForm({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  return <SignUpForm returnTo={normalizeAuthReturnPath(from)} />;
}
