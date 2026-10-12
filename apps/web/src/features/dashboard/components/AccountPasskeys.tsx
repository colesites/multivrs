"use client";

import { Fingerprint } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { describeDevice } from "@/features/dashboard/lib/describe-device";
import {
  askToSignInAgain,
  needsRecentSignIn,
} from "@/features/dashboard/lib/fresh-session";
import type { AccountPasskey } from "@/features/dashboard/types/account-security.types";
import { authClient } from "@/lib/auth-client";

/** Passkeys on the account: add one from this device, or remove any. */
export function AccountPasskeys({
  passkeys,
}: {
  passkeys: AccountPasskey[] | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  function add() {
    setBusy("add");
    void authClient.passkey
      .addPasskey({ name: describeDevice(navigator.userAgent).label })
      .then((result) => {
        if (needsRecentSignIn(result?.error)) {
          askToSignInAgain(`${window.location.pathname}#authentication`);
          return;
        }
        if (result?.error) {
          if (
            !cancelled("code" in result.error ? result.error.code : undefined)
          ) {
            toast.error(
              result.error.message ?? "The passkey couldn't be added.",
            );
          }
          return;
        }
        toast.success("Passkey added. You can use it to sign in.");
        router.refresh();
      })
      .catch(() => toast.error("The passkey couldn't be added."))
      .finally(() => setBusy(null));
  }

  function remove(passkey: AccountPasskey) {
    setBusy(passkey.id);
    void authClient.passkey
      .deletePasskey({ id: passkey.id })
      .then((result) => {
        if (result.error) {
          toast.error(
            result.error.message ?? "The passkey couldn't be removed.",
          );
          return;
        }
        toast.success("Passkey removed.");
        router.refresh();
      })
      .catch(() => toast.error("The passkey couldn't be removed."))
      .finally(() => setBusy(null));
  }

  return (
    <section
      className="overflow-hidden rounded-2xl border border-(--hairline) bg-background/70"
      aria-labelledby="passkeys-title"
    >
      <div className="flex items-center justify-between gap-4 border-b border-(--hairline) px-5 py-4">
        <div>
          <h2 id="passkeys-title" className="text-sm font-semibold">
            Passkeys
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Sign in with Face ID, Touch ID, Windows Hello, or a security key
            instead of a password.
          </p>
        </div>
        <Button
          variant="outline"
          disabled={busy !== null || passkeys === null}
          onClick={add}
        >
          <Fingerprint className="size-4" />
          {busy === "add" ? "Waiting for your device…" : "Add passkey"}
        </Button>
      </div>
      {passkeys === null ? (
        <p className="px-5 py-4 text-xs text-muted-foreground">
          Passkeys couldn't be loaded. Try again shortly.
        </p>
      ) : passkeys.length === 0 ? (
        <p className="px-5 py-4 text-xs text-muted-foreground">
          No passkeys yet.
        </p>
      ) : (
        <ul className="divide-y divide-(--hairline)">
          {passkeys.map((passkey) => (
            <li key={passkey.id} className="flex items-center gap-3 px-5 py-4">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-(--hairline) text-muted-foreground">
                <Fingerprint className="size-4" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {passkey.name ?? passkey.provider ?? "Passkey"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {[
                    passkey.provider,
                    passkey.createdAt &&
                      `Added ${new Date(passkey.createdAt).toLocaleDateString(
                        "en-US",
                        { dateStyle: "medium", timeZone: "UTC" },
                      )}`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <Button
                variant="ghost"
                disabled={busy !== null}
                onClick={() => remove(passkey)}
              >
                {busy === passkey.id ? "Removing…" : "Remove"}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** The person closed the system prompt; that isn't an error to report. */
function cancelled(code: string | undefined): boolean {
  return Boolean(code && /CANCEL|ABORT|NOT_ALLOWED/i.test(code));
}
