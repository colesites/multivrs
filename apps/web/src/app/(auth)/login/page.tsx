import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { SignInForm } from "@/components/auth/sign-in-form";
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
  const { from } = await searchParams;
  return (
    <AuthLayout>
      <SignInForm returnTo={normalizeAuthReturnPath(from)} />
    </AuthLayout>
  );
}
