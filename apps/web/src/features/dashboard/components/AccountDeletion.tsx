"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AccountDeletionBlocker } from "@/features/dashboard/types/account-security.types";
import { authClient } from "@/lib/auth-client";

/**
 * Deletes the account after an emailed confirmation. Anything that lives
 * outside Multivrs (plans, domains, projects) has to be removed first.
 */
export function AccountDeletion({
  username,
  email,
  blockers,
}: {
  username: string;
  email: string;
  blockers: AccountDeletionBlocker[];
}) {
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  function requestDeletion() {
    if (confirmation !== username || busy) return;
    setBusy(true);
    void authClient
      .deleteUser({ callbackURL: "/home" })
      .then((result) => {
        if (result.error) {
          toast.error(
            result.error.message ?? "Your account couldn't be deleted.",
          );
          return;
        }
        setSent(true);
      })
      .catch(() => toast.error("Your account couldn't be deleted."))
      .finally(() => setBusy(false));
  }

  return (
    <section
      className="overflow-hidden rounded-2xl border border-red-400/20 bg-background/70"
      aria-labelledby="delete-account-title"
    >
      <div className="border-b border-red-400/15 px-5 py-4">
        <h2 id="delete-account-title" className="text-sm font-semibold">
          Delete account
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Permanently delete your account, your team, and everything in it. This
          can't be undone.
        </p>
      </div>
      <div className="space-y-4 p-5">
        {blockers.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm">Before you can delete your account:</p>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              {blockers.map((blocker) => (
                <li key={blocker.message} className="flex gap-2">
                  <span aria-hidden="true">·</span>
                  <Link
                    href={blocker.href}
                    className="underline underline-offset-4 hover:text-foreground"
                  >
                    {blocker.message}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : sent ? (
          <p className="text-sm text-muted-foreground">
            We sent a confirmation link to {email}. Your account is deleted when
            you open it.
          </p>
        ) : (
          <div className="max-w-md space-y-3">
            <label
              htmlFor="delete-account-confirmation"
              className="block space-y-2 text-xs text-muted-foreground"
            >
              <span>
                Type{" "}
                <span className="font-geist-mono text-foreground">
                  {username}
                </span>{" "}
                to confirm
              </span>
              <Input
                id="delete-account-confirmation"
                autoComplete="off"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
              />
            </label>
            <Button
              variant="destructive"
              disabled={confirmation !== username || busy}
              onClick={requestDeletion}
            >
              {busy ? "Sending…" : "Delete account"}
            </Button>
            <p className="text-xs text-muted-foreground">
              We'll email {email} a link to confirm.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
