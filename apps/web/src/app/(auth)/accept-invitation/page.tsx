import type { Metadata } from "next";
import { Suspense } from "react";
import { AcceptInvitation } from "@/components/auth/AcceptInvitation";
import { AuthLayout } from "@/components/auth/auth-layout";
import { invitationAccount } from "@/lib/services/account-team.service";

export const metadata: Metadata = {
  title: "Workspace invitation · Multivrs",
};

export default function AcceptInvitationPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  return (
    <AuthLayout>
      <Suspense
        fallback={<p className="text-sm text-white/50">Loading invitation…</p>}
      >
        <Invitation searchParams={searchParams} />
      </Suspense>
    </AuthLayout>
  );
}

async function Invitation({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id = "" } = await searchParams;
  const account = id ? await invitationAccount(id) : null;
  return <AcceptInvitation invitationId={id} account={account} />;
}
