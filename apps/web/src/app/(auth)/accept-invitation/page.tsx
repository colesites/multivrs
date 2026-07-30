import type { Metadata } from "next";
import { Suspense } from "react";
import { AcceptInvitation } from "@/components/auth/AcceptInvitation";
import { AuthLayout } from "@/components/auth/auth-layout";

export const metadata: Metadata = {
  title: "Workspace invitation · Multivrs",
};

export default function AcceptInvitationPage() {
  return (
    <AuthLayout>
      <Suspense
        fallback={<p className="text-sm text-white/50">Loading invitation…</p>}
      >
        <AcceptInvitation />
      </Suspense>
    </AuthLayout>
  );
}
