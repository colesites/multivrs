import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { apiUrl } from "@/lib/api";

export const metadata = { title: "Set a new password" };

export default function ResetPasswordPage() {
  return (
    <AuthShell
      eyebrow="Password reset"
      serif="Set"
      title="a new password"
      subtitle="Choose a new password for your VRS Pay account. You'll be signed out everywhere else."
      footer={
        <a
          href="/sign-in"
          className="font-medium text-brand-600 hover:text-brand-700"
        >
          Back to sign in
        </a>
      }
    >
      <ResetPasswordForm apiUrl={apiUrl} />
    </AuthShell>
  );
}
