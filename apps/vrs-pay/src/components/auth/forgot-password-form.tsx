"use client";

import { Loader2, MailCheck } from "lucide-react";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authRequest } from "./auth-client";

/** Asks for a reset link. Always answers the same way, so it never reveals who has an account. */
export function ForgotPasswordForm({ apiUrl }: { apiUrl: string }) {
  const [pending, setPending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const email = String(new FormData(event.currentTarget).get("email") ?? "");
    const result = await authRequest(apiUrl, "/request-password-reset", {
      email,
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setPending(false);
    if (result.ok) setSentTo(email);
    else setError(result.message);
  }

  if (sentTo) {
    return (
      <div className="rounded-2xl border border-line bg-wash p-5 text-sm text-ink-soft">
        <MailCheck className="size-5 text-brand-600" />
        <p className="mt-3">
          If <span className="font-medium text-ink">{sentTo}</span> has a VRS
          Pay account, a reset link is on its way. It works for one hour.
        </p>
      </div>
    );
  }
  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <Label className="grid gap-1.5 text-ink">
        Work email
        <Input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          size="lg"
        />
      </Label>
      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
        >
          {error}
        </p>
      )}
      <Button type="submit" disabled={pending} size="lg" className="mt-1">
        {pending && <Loader2 className="size-4 animate-spin" />} Send reset link
      </Button>
    </form>
  );
}
