import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { redirectAuthenticatedUser } from "@/lib/auth/redirect-authenticated";

export const metadata: Metadata = {
  title: "Create account · Multivrs",
  description: "Create your Multivrs account.",
};

export default async function SignupPage() {
  await redirectAuthenticatedUser();

  return (
    <AuthLayout>
      <SignUpForm />
    </AuthLayout>
  );
}
