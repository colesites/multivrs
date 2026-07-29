import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { SignInForm } from "@/components/auth/sign-in-form";
import { redirectAuthenticatedUser } from "@/lib/auth/redirect-authenticated";
import { normalizeAuthReturnPath } from "@/lib/auth/return-path";

export const metadata: Metadata = {
  title: "Sign in · Multivrs",
  description: "Sign in to your Multivrs account.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  await redirectAuthenticatedUser();

  return (
    <AuthLayout>
      <Suspense fallback={null}>
        <LoginForm searchParams={searchParams} />
      </Suspense>
    </AuthLayout>
  );
}

async function LoginForm({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  return <SignInForm returnTo={normalizeAuthReturnPath(from)} />;
}
