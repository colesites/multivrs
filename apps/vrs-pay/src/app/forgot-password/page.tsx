import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { apiUrl } from "@/lib/api";

export const metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Password reset"
      serif="Forgot"
      title="your password?"
      subtitle="Enter your email and we'll send you a link to set a new one."
      footer={
        <a
          href="/sign-in"
          className="font-medium text-brand-600 hover:text-brand-700"
        >
          Back to sign in
        </a>
      }
    >
      <ForgotPasswordForm apiUrl={apiUrl} />
    </AuthShell>
  );
}
