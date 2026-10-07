import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { apiUrl } from "@/lib/api";

export const metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <AuthShell
      eyebrow="Sign in"
      serif="Welcome"
      title="back"
      subtitle="Sign in to your VRS Pay dashboard."
      footer={
        <>
          New to VRS Pay?{" "}
          <a
            href="/sign-up"
            className="font-medium text-brand-600 hover:text-brand-700"
          >
            Create an account
          </a>
        </>
      }
    >
      <AuthForm mode="sign-in" apiUrl={apiUrl} />
    </AuthShell>
  );
}
