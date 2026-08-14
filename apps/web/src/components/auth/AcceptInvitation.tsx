"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export function AcceptInvitation() {
  const invitationId = useSearchParams().get("id") ?? "";
  const { data: session, isPending } = authClient.useSession();
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  function accept() {
    if (!invitationId || loading) return;
    setLoading(true);
    void authClient.organization
      .acceptInvitation({ invitationId })
      .then((result) => {
        if (result.error) {
          toast.error(
            result.error.message ?? "The invitation could not be accepted.",
          );
          return;
        }
        setAccepted(true);
      })
      .catch(() => toast.error("The invitation could not be accepted."))
      .finally(() => setLoading(false));
  }

  if (isPending)
    return <p className="text-sm text-white/50">Checking invitation…</p>;
  if (!session) {
    const from = `/accept-invitation?id=${encodeURIComponent(invitationId)}`;
    return (
      <div className="space-y-4">
        <h1 className="font-clash text-2xl font-semibold text-white">
          Join your workspace
        </h1>
        <p className="text-sm leading-6 text-white/50">
          Sign in with the invited email address before accepting this
          invitation.
        </p>
        <Link
          className="inline-flex h-11 items-center rounded-lg bg-[#A855F7] px-5 text-sm font-semibold text-white"
          href={`/login?from=${encodeURIComponent(from)}`}
        >
          Sign in
        </Link>
      </div>
    );
  }
  if (accepted) {
    return (
      <div className="space-y-4">
        <h1 className="font-clash text-2xl font-semibold text-white">
          Invitation accepted
        </h1>
        <p className="text-sm text-white/50">
          The workspace is now available in your Multivrs account.
        </p>
        <Link className="text-sm font-medium text-purple-400" href="/home">
          Continue to dashboard
        </Link>
      </div>
    );
  }
  return (
    <div className="space-y-5">
      <h1 className="font-clash text-2xl font-semibold text-white">
        Workspace invitation
      </h1>
      <p className="text-sm leading-6 text-white/50">
        Accept this invitation as {session.user.email}.
      </p>
      <button
        className="h-11 rounded-lg bg-[#A855F7] px-5 text-sm font-semibold text-white disabled:opacity-60"
        disabled={!invitationId || loading}
        onClick={accept}
        type="button"
      >
        {loading ? "Accepting…" : "Accept invitation"}
      </button>
    </div>
  );
}
