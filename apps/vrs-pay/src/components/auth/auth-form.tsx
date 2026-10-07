"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authRequest, hasSession, socialSignIn } from "./auth-client";
import { SocialButtons } from "./social-buttons";

type Mode = "sign-in" | "sign-up";

/**
 * Email + password sign-in / sign-up against the VRS Pay API, plus GitHub
 * and Google when configured. Signed-in visitors go straight to /dashboard.
 */
export function AuthForm({ mode, apiUrl }: { mode: Mode; apiUrl: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [social, setSocial] = useState<string[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    hasSession(apiUrl).then(
      (signedIn) => signedIn && window.location.replace("/dashboard"),
    );
    fetch(`${apiUrl}/auth/providers`)
      .then((res) => res.json())
      .then((data: { social?: string[] }) => setSocial(data.social ?? []))
      .catch(() => setSocial([]));
    const params = new URLSearchParams(window.location.search);
    if (params.has("reset"))
      setNotice("Your password is updated. Sign in with the new one.");
    if (params.has("error")) {
      setError("Sign-in with that provider didn't finish. Try again.");
    }
  }, [apiUrl]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const result =
      mode === "sign-up"
        ? await authRequest(apiUrl, "/sign-up/email", {
            name: String(form.get("name") ?? ""),
            email,
            password,
          })
        : await authRequest(apiUrl, "/sign-in/email", { email, password });
    if (result.ok) {
      window.location.assign("/dashboard");
      return;
    }
    setError(result.message);
    setPending(false);
  }

  async function onSocial(provider: string) {
    setPending(true);
    setError(null);
    const message = await socialSignIn(apiUrl, provider);
    if (message) {
      setError(message);
      setPending(false);
    }
  }

  return (
    <div>
      <SocialButtons providers={social} disabled={pending} onPick={onSocial} />
      <form onSubmit={onSubmit} className="grid gap-4">
        {mode === "sign-up" && (
          <Label className="grid gap-1.5 text-ink">
            Your name
            <Input
              name="name"
              required
              autoComplete="name"
              placeholder="Ada Lovelace"
              size="lg"
            />
          </Label>
        )}
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
        <Label className="grid gap-1.5 text-ink">
          Password
          <span className="relative">
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              autoComplete={
                mode === "sign-up" ? "new-password" : "current-password"
              }
              placeholder={
                mode === "sign-up" ? "At least 8 characters" : "Your password"
              }
              size="lg"
              className="pr-11"
            />
            <Button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              variant="ghost"
              size="icon"
              className="absolute inset-y-0 right-0 h-full w-11 text-mute hover:bg-transparent hover:text-ink"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </Button>
          </span>
        </Label>
        {mode === "sign-in" && (
          <a
            href="/forgot-password"
            className="-mt-2 justify-self-end text-sm text-brand-600 hover:text-brand-700"
          >
            Forgot password?
          </a>
        )}
        {notice && (
          <p className="rounded-xl border border-line bg-wash px-3.5 py-2.5 text-sm text-ink-soft">
            {notice}
          </p>
        )}
        {error && (
          <p
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
          >
            {error}
          </p>
        )}
        <Button type="submit" disabled={pending} size="lg" className="mt-1">
          {pending && <Loader2 className="size-4 animate-spin" />}
          {mode === "sign-up" ? "Create account" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
