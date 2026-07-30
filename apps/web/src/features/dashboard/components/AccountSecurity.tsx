"use client";

import { Copy, KeyRound, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

interface Enrollment {
  backupCodes: string[];
  secret: string;
}

export function AccountSecurity({
  initiallyEnabled,
}: {
  initiallyEnabled: boolean;
}) {
  const [enabled, setEnabled] = useState(initiallyEnabled);
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [enrollment, setEnrollment] = useState<Enrollment>();
  const [loading, setLoading] = useState(false);

  function beginEnrollment() {
    if (loading) return;
    setLoading(true);
    void authClient.twoFactor
      .enable({ issuer: "Multivrs", password: password || undefined })
      .then((result) => {
        if (result.error) {
          toast.error(result.error.message ?? "MFA enrollment failed.");
          return;
        }
        const uri = new URL(result.data.totpURI);
        setEnrollment({
          backupCodes: result.data.backupCodes,
          secret: uri.searchParams.get("secret") ?? "",
        });
      })
      .catch(() => toast.error("MFA enrollment failed."))
      .finally(() => setLoading(false));
  }

  function confirmEnrollment() {
    if (loading || !code.trim()) return;
    setLoading(true);
    void authClient.twoFactor
      .verifyTotp({ code: code.trim() })
      .then((result) => {
        if (result.error) {
          toast.error(
            result.error.message ?? "The authenticator code is invalid.",
          );
          return;
        }
        setEnabled(true);
        setCode("");
        setPassword("");
        toast.success("Multi-factor authentication is enabled.");
      })
      .catch(() => toast.error("MFA verification failed."))
      .finally(() => setLoading(false));
  }

  function disable() {
    if (loading) return;
    setLoading(true);
    void authClient.twoFactor
      .disable({ password: password || undefined })
      .then((result) => {
        if (result.error) {
          toast.error(result.error.message ?? "MFA could not be disabled.");
          return;
        }
        setEnabled(false);
        setEnrollment(undefined);
        setPassword("");
        toast.success("Multi-factor authentication is disabled.");
      })
      .catch(() => toast.error("MFA could not be disabled."))
      .finally(() => setLoading(false));
  }

  return (
    <section
      className="border-t border-[var(--hairline)] py-8"
      aria-labelledby="account-security-title"
    >
      <div className="flex items-start gap-4">
        <span className="grid size-10 place-items-center rounded-xl border border-blue-400/20 bg-blue-400/[0.06]">
          <ShieldCheck className="size-4 text-blue-400" />
        </span>
        <div className="min-w-0 flex-1">
          <h2 id="account-security-title" className="text-base font-semibold">
            Multi-factor authentication
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Require a time-based code after password or social sign-in.
          </p>
        </div>
        <span className="font-geist-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {enabled ? "Enabled" : "Off"}
        </span>
      </div>

      <div className="ml-14 mt-5 max-w-xl space-y-4">
        <div className="space-y-2">
          <Label htmlFor="mfa-password">Current password</Label>
          <Input
            id="mfa-password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Not required for passwordless accounts"
            type="password"
            value={password}
          />
        </div>
        {!enabled && !enrollment && (
          <Button disabled={loading} onClick={beginEnrollment}>
            <KeyRound className="size-4" />
            Set up authenticator
          </Button>
        )}
        {enabled && (
          <Button disabled={loading} onClick={disable} variant="outline">
            Disable MFA
          </Button>
        )}
        {enrollment && (
          <div className="space-y-4 border-t border-[var(--hairline)] pt-5">
            <div>
              <p className="text-sm font-medium">Authenticator secret</p>
              <div className="mt-2 flex items-center gap-2 font-geist-mono text-xs text-muted-foreground">
                <code className="break-all">{enrollment.secret}</code>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Copy authenticator secret"
                  onClick={() =>
                    void navigator.clipboard.writeText(enrollment.secret)
                  }
                >
                  <Copy className="size-3.5" />
                </Button>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Recovery codes</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Store these once in a password manager.
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {enrollment.backupCodes.map((backupCode) => (
                  <code
                    className="font-geist-mono text-xs text-muted-foreground"
                    key={backupCode}
                  >
                    {backupCode}
                  </code>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                aria-label="Authenticator verification code"
                inputMode="numeric"
                maxLength={6}
                onChange={(event) => setCode(event.target.value)}
                placeholder="123456"
                value={code}
              />
              <Button
                disabled={loading || code.length !== 6}
                onClick={confirmEnrollment}
              >
                Confirm
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
