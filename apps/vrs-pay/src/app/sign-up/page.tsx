import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { apiUrl } from "@/lib/api";

export const metadata = { title: "Create your account" };

export default function SignUpPage() {
  return (
    <AuthShell
      eyebrow="Get started"
      serif="Start"
      title="taking payments"
      subtitle="Create your account. You'll be in test mode, with a sandbox ready to go."
      footer={
        <>
          Already have an account?{" "}
          <a
            href="/sign-in"
            className="font-medium text-brand-600 hover:text-brand-700"
          >
            Sign in
          </a>
        </>
      }
    >
      <AuthForm mode="sign-up" apiUrl={apiUrl} />
    </AuthShell>
  );
}
