import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = {
  title: "Create account · Multivrs",
  description: "Create your Multivrs account.",
};

export default function SignupPage() {
  return (
    <AuthLayout>
      <SignUpForm />
    </AuthLayout>
  );
}
