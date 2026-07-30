"use client";

import { KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export function TwoFactorForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [backupMode, setBackupMode] = useState(false);
  const [loading, setLoading] = useState(false);

  function verify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading || !code.trim()) return;
    setLoading(true);
    const request = backupMode
      ? authClient.twoFactor.verifyBackupCode({ code: code.trim() })
      : authClient.twoFactor.verifyTotp({
          code: code.trim(),
          trustDevice: true,
        });
    void request
      .then((result) => {
        if (result.error) {
          toast.error(
            result.error.message ?? "The verification code is invalid.",
          );
          return;
        }
        const stored = sessionStorage.getItem("multivrs.two-factor-return");
        const destination =
          stored?.startsWith("/") && !stored.startsWith("//")
            ? stored
            : "/home";
        sessionStorage.removeItem("multivrs.two-factor-return");
        router.replace(destination);
        router.refresh();
      })
      .catch(() => toast.error("Two-factor verification failed."))
      .finally(() => setLoading(false));
  }

  return (
    <div className="space-y-6">
      <div className="grid size-10 place-items-center rounded-xl border border-blue-500/25 bg-blue-500/10">
        <KeyRound className="size-4 text-blue-400" />
      </div>
      <div>
        <h1 className="font-clash text-2xl font-semibold tracking-tight text-white">
          Two-factor verification
        </h1>
        <p className="mt-2 text-sm leading-6 text-white/50">
          {backupMode
            ? "Enter one of your unused recovery codes."
            : "Enter the six-digit code from your authenticator app."}
        </p>
      </div>
      <form className="space-y-4" onSubmit={verify}>
        <div className="space-y-2">
          <Label
            htmlFor="two-factor-code"
            className="font-mono text-[11px] uppercase tracking-wider text-white/50"
          >
            {backupMode ? "Recovery code" : "Authenticator code"}
          </Label>
          <Input
            autoComplete="one-time-code"
            autoFocus
            className="h-11 rounded-lg border-white/10 bg-white/[0.03] font-mono tracking-[0.2em] text-white"
            id="two-factor-code"
            inputMode={backupMode ? "text" : "numeric"}
            maxLength={backupMode ? 32 : 6}
            onChange={(event) => setCode(event.target.value)}
            value={code}
          />
        </div>
        <button
          className="h-11 w-full rounded-lg bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          {loading ? "Verifying…" : "Verify"}
        </button>
      </form>
      <button
        className="text-sm text-white/45 hover:text-white"
        onClick={() => {
          setBackupMode((current) => !current);
          setCode("");
        }}
        type="button"
      >
        {backupMode ? "Use authenticator code" : "Use a recovery code"}
      </button>
    </div>
  );
}
