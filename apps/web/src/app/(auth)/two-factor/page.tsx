import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { TwoFactorForm } from "@/components/auth/two-factor-form";

export const metadata: Metadata = {
  title: "Two-factor verification · Multivrs",
  description: "Complete two-factor verification for your Multivrs account.",
};

export default function TwoFactorPage() {
  return (
    <AuthLayout>
      <TwoFactorForm />
    </AuthLayout>
  );
}
