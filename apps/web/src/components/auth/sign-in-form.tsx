"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { type SignInInput, signInSchema } from "@/validators/auth.validators";

const labelClass =
  "font-mono text-[11px] font-medium uppercase tracking-wider text-white/50";
const inputClass =
  "h-11 rounded-lg border-white/10 bg-white/[0.03] text-white placeholder:text-white/30 focus-visible:border-[#2563eb] focus-visible:ring-[#2563eb]/30";

/**
 * Email + password sign-in form, with Google/GitHub OAuth.
 * Mono + blue (#2563eb) styling, no gradients.
 */
export function SignInForm({ returnTo }: { returnTo: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<SignInInput>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof SignInInput, string>>
  >({});

  const handleChange =
    (field: keyof SignInInput) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const validation = signInSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Partial<Record<keyof SignInInput, string>> = {};
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof SignInInput;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    if (isLoading) return;
    setIsLoading(true);
    void authClient.signIn
      .email({
        email: formData.email,
        password: formData.password,
        callbackURL: returnTo,
      })
      .then((result) => {
        if (result.error) {
          toast.error(result.error.message || "Invalid email or password.");
          return;
        }
        toast.success("Welcome back.");
        router.replace(returnTo);
        router.refresh();
      })
      .catch(() =>
        toast.error("An unexpected error occurred. Please try again."),
      )
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="font-clash text-2xl font-semibold tracking-tight text-white">
          Sign in
        </h1>
        <p className="text-sm text-white/50">Welcome back to Multivrs.</p>
      </div>

      <OAuthButtons callbackURL={returnTo} />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-black/40 px-3 font-mono text-[10px] uppercase tracking-widest text-white/30">
            or
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className={labelClass}>
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange("email")}
            disabled={isLoading}
            aria-invalid={!!errors.email}
            className={inputClass}
          />
          {errors.email && (
            <p className="text-xs text-red-400">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className={labelClass}>
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="font-mono text-[11px] text-white/40 transition-colors hover:text-[#2563eb]"
            >
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange("password")}
              disabled={isLoading}
              aria-invalid={!!errors.password}
              className={`${inputClass} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-white/70"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-400">{errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="h-11 w-full rounded-lg bg-[#2563eb] text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="text-center text-sm text-white/40">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-white transition-colors hover:text-[#2563eb]"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
