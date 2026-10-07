"use client";

import { Loader2 } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authRequest } from "./auth-client";

/** Sets a new password from the emailed link (`?token=…`), then sends you to sign in. */
export function ResetPasswordForm({ apiUrl }: { apiUrl: string }) {
  const [token, setToken] = useState<string | null>(null);
  const [linkError, setLinkError] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token"));
    setLinkError(params.has("error") || !params.get("token"));
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    if (password !== String(form.get("confirm") ?? "")) {
      setError("The two passwords don't match.");
      return;
    }
    setPending(true);
    setError(null);
    const result = await authRequest(apiUrl, "/reset-password", {
      newPassword: password,
      token,
    });
    if (result.ok) {
      window.location.assign("/sign-in?reset=1");
      return;
    }
    setError(result.message);
    setPending(false);
  }

  if (linkError) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
        This reset link is invalid or has expired.{" "}
        <a href="/forgot-password" className="font-medium underline">
          Get a new one
        </a>
        .
      </p>
    );
  }
  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <Label className="grid gap-1.5 text-ink">
        New password
        <Input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          size="lg"
        />
      </Label>
      <Label className="grid gap-1.5 text-ink">
        Confirm new password
        <Input
          name="confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
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
      <Button
        type="submit"
        disabled={pending || !token}
        size="lg"
        className="mt-1"
      >
        {pending && <Loader2 className="size-4 animate-spin" />} Set new
        password
      </Button>
    </form>
  );
}
