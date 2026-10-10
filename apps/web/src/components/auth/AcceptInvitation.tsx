"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export function AcceptInvitation({
  invitationId,
  account,
}: {
  invitationId: string;
  /** Username of the account whose team this is; null for older workspaces. */
  account: string | null;
}) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
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
          setLoading(false);
          return;
        }
        toast.success(
          account ? `You joined ${account}.` : "Invitation accepted.",
        );
        router.replace(account ? `/${account}` : "/dashboard");
        router.refresh();
      })
      .catch(() => {
        toast.error("The invitation could not be accepted.");
        setLoading(false);
      });
  }

  if (isPending)
    return <p className="text-sm text-white/50">Checking invitation…</p>;
  if (!session) {
    const from = encodeURIComponent(
      `/accept-invitation?id=${encodeURIComponent(invitationId)}`,
    );
    return (
      <div className="space-y-4">
        <h1 className="font-clash text-2xl font-semibold text-white">
          Join {account ?? "your workspace"}
        </h1>
        <p className="text-sm leading-6 text-white/50">
          Sign in, or create an account, with the email address this invitation
          was sent to.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            className="inline-flex h-11 items-center rounded-lg bg-[#A855F7] px-5 text-sm font-semibold text-white"
            href={`/login?from=${from}`}
          >
            Sign in
          </Link>
          <Link
            className="inline-flex h-11 items-center rounded-lg border border-white/10 px-5 text-sm font-semibold text-white"
            href={`/signup?from=${from}`}
          >
            Create account
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-5">
      <h1 className="font-clash text-2xl font-semibold text-white">
        Join {account ?? "this workspace"}
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
