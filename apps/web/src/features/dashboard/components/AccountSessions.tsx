"use client";

import { Monitor, Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { describeDevice } from "@/features/dashboard/lib/describe-device";
import type { AccountSession } from "@/features/dashboard/types/account-security.types";
import { authClient } from "@/lib/auth-client";

/** Where the account is signed in, with sign-out for each device. */
export function AccountSessions({ sessions }: { sessions: AccountSession[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const others = sessions.filter((session) => !session.current);

  function run(key: string, action: Promise<{ error: unknown }>, done: string) {
    setBusy(key);
    void action
      .then((result) => {
        if (result.error) {
          toast.error("That session couldn't be signed out.");
          return;
        }
        toast.success(done);
        router.refresh();
      })
      .catch(() => toast.error("That session couldn't be signed out."))
      .finally(() => setBusy(null));
  }

  return (
    <section
      className="overflow-hidden rounded-2xl border border-(--hairline) bg-background/70"
      aria-labelledby="sessions-title"
    >
      <div className="flex items-center justify-between gap-4 border-b border-(--hairline) px-5 py-4">
        <div>
          <h2 id="sessions-title" className="text-sm font-semibold">
            Active sessions
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Devices signed in to your account. Sign out any you don't recognise.
          </p>
        </div>
        {others.length > 0 && (
          <Button
            variant="outline"
            disabled={busy !== null}
            onClick={() =>
              run(
                "others",
                authClient.revokeOtherSessions(),
                "Signed out of other sessions.",
              )
            }
          >
            Sign out others
          </Button>
        )}
      </div>
      <ul className="divide-y divide-(--hairline)">
        {sessions.map((session) => {
          const device = describeDevice(session.userAgent);
          const Icon = device.mobile ? Smartphone : Monitor;
          return (
            <li key={session.id} className="flex items-center gap-3 px-5 py-4">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-(--hairline) text-muted-foreground">
                <Icon className="size-4" strokeWidth={1.75} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-sm font-medium">
                  {device.label}
                  {session.current && (
                    <span className="rounded-full border border-(--hairline-strong) px-2 py-0.5 font-geist-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                      This device
                    </span>
                  )}
                </p>
                {/* "Last active" is relative to now, which differs slightly between server and browser. */}
                <p
                  className="truncate text-xs text-muted-foreground"
                  suppressHydrationWarning
                >
                  {[
                    session.ipAddress,
                    `Last active ${relativeTime(session.lastActiveAt)}`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              {!session.current && (
                <Button
                  variant="ghost"
                  disabled={busy !== null}
                  onClick={() =>
                    run(
                      session.id,
                      authClient.revokeSession({ token: session.token }),
                      "Session signed out.",
                    )
                  }
                >
                  {busy === session.id ? "Signing out…" : "Sign out"}
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

const UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ["day", 86_400_000],
  ["hour", 3_600_000],
  ["minute", 60_000],
];

function relativeTime(iso: string): string {
  const elapsed = new Date(iso).getTime() - Date.now();
  const format = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  for (const [unit, size] of UNITS) {
    if (Math.abs(elapsed) >= size) {
      return format.format(Math.round(elapsed / size), unit);
    }
  }
  return "just now";
}
