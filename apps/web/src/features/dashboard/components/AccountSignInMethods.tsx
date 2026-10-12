"use client";

import { KeyRound } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { GitHubIcon, GoogleIcon } from "@/components/auth/oauth-buttons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  askToSignInAgain,
  needsRecentSignIn,
} from "@/features/dashboard/lib/fresh-session";
import type {
  AccountSignIn,
  SocialProvider,
} from "@/features/dashboard/types/account-security.types";
import { authClient } from "@/lib/auth-client";

const PROVIDERS: Record<
  SocialProvider,
  { label: string; icon: () => React.JSX.Element }
> = {
  github: { label: "GitHub", icon: GitHubIcon },
  google: { label: "Google", icon: GoogleIcon },
};

/** Password and social logins: connect, disconnect, change password. */
export function AccountSignInMethods({ signIn }: { signIn: AccountSignIn }) {
  const router = useRouter();
  const pathname = usePathname();
  const [busy, setBusy] = useState<SocialProvider | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);
  // Keep at least one way in: the last method can't be removed.
  const methods =
    signIn.connected.length +
    (signIn.hasPassword ? 1 : 0) +
    (signIn.passkeys?.length ?? 0);

  function connect(provider: SocialProvider) {
    setBusy(provider);
    void authClient
      .linkSocial({ provider, callbackURL: `${pathname}#authentication` })
      .then((result) => {
        if (result.error) {
          toast.error(
            result.error.message ?? "That account couldn't be connected.",
          );
          setBusy(null);
        }
      })
      .catch(() => {
        toast.error("That account couldn't be connected.");
        setBusy(null);
      });
  }

  function disconnect(provider: SocialProvider) {
    setBusy(provider);
    void authClient
      .unlinkAccount({ providerId: provider })
      .then((result) => {
        if (needsRecentSignIn(result.error)) {
          askToSignInAgain(`${pathname}#authentication`);
          return;
        }
        if (result.error) {
          toast.error(
            result.error.message ?? "That account couldn't be disconnected.",
          );
          return;
        }
        toast.success(`${PROVIDERS[provider].label} disconnected.`);
        router.refresh();
      })
      .catch(() => toast.error("That account couldn't be disconnected."))
      .finally(() => setBusy(null));
  }

  return (
    <section
      className="overflow-hidden rounded-2xl border border-(--hairline) bg-background/70"
      aria-labelledby="sign-in-methods-title"
    >
      <div className="border-b border-(--hairline) px-5 py-4">
        <h2 id="sign-in-methods-title" className="text-sm font-semibold">
          Sign-in methods
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          The ways you can sign in to Multivrs. You need at least one.
        </p>
      </div>
      <ul className="divide-y divide-(--hairline)">
        <li className="px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-(--hairline) text-muted-foreground">
              <KeyRound className="size-4" strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">Password</p>
              <p className="text-xs text-muted-foreground">
                {signIn.hasPassword
                  ? "Sign in with your email and password."
                  : "No password set. You sign in with a connected account."}
              </p>
            </div>
            {signIn.hasPassword && !changingPassword && (
              <Button
                variant="outline"
                onClick={() => setChangingPassword(true)}
              >
                Change password
              </Button>
            )}
          </div>
          {changingPassword && (
            <PasswordForm
              onDone={(changed) => {
                setChangingPassword(false);
                if (changed) router.refresh();
              }}
            />
          )}
        </li>
        {signIn.available.map((provider) => {
          const { label, icon: Icon } = PROVIDERS[provider];
          const connected = signIn.connected.includes(provider);
          return (
            <li key={provider} className="flex items-center gap-3 px-5 py-4">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-(--hairline)">
                <Icon />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">
                  {connected ? "Connected" : "Not connected"}
                </p>
              </div>
              {connected ? (
                <Button
                  variant="ghost"
                  disabled={busy !== null || methods <= 1}
                  title={
                    methods <= 1
                      ? "Add another sign-in method before disconnecting this one."
                      : undefined
                  }
                  onClick={() => disconnect(provider)}
                >
                  Disconnect
                </Button>
              ) : (
                <Button
                  variant="outline"
                  disabled={busy !== null}
                  onClick={() => connect(provider)}
                >
                  {busy === provider ? "Connecting…" : "Connect"}
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function PasswordForm({ onDone }: { onDone: (changed: boolean) => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [signOutOthers, setSignOutOthers] = useState(true);
  const [busy, setBusy] = useState(false);
  const valid = currentPassword.length > 0 && newPassword.length >= 8;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!valid || busy) return;
    setBusy(true);
    void authClient
      .changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: signOutOthers,
      })
      .then((result) => {
        if (result.error) {
          toast.error(
            result.error.message ?? "Your password couldn't be changed.",
          );
          return;
        }
        toast.success("Password changed.");
        onDone(true);
      })
      .catch(() => toast.error("Your password couldn't be changed."))
      .finally(() => setBusy(false));
  }

  return (
    <form onSubmit={submit} className="mt-4 max-w-md space-y-4 pl-11">
      <div className="space-y-2">
        <Label htmlFor="current-password">Current password</Label>
        <Input
          id="current-password"
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="new-password">New password</Label>
        <Input
          id="new-password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
        />
        <p className="text-xs text-muted-foreground">At least 8 characters.</p>
      </div>
      <Label className="flex items-center gap-2 text-sm font-normal">
        <Checkbox
          checked={signOutOthers}
          onCheckedChange={(checked) => setSignOutOthers(checked === true)}
        />
        Sign out of other devices
      </Label>
      <div className="flex gap-2">
        <Button type="submit" disabled={!valid || busy}>
          {busy ? "Saving…" : "Update password"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => onDone(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
