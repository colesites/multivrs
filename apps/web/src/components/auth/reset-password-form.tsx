"use client";

import { ArrowLeft, CheckCircle2, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import {
  type PasswordResetInput,
  passwordResetSchema,
} from "@/validators/auth.validators";

const labelClass =
  "font-mono text-[11px] font-medium uppercase tracking-wider text-white/50";
const inputClass =
  "h-11 rounded-lg border-white/10 bg-white/[0.03] text-white placeholder:text-white/30 focus-visible:border-[#2563eb] focus-visible:ring-[#2563eb]/30";

/**
 * Set a new password using the `token` from the reset email link. On success
 * we show a confirmation and route to /login.
 */
export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  // Better Auth appends ?error=invalid_token when the link is bad/expired.
  const linkError = searchParams.get("error");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [formData, setFormData] = useState<PasswordResetInput>({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof PasswordResetInput, string>>
  >({});

  const handleChange =
    (field: keyof PasswordResetInput) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    if (!token) {
      toast.error("This reset link is invalid or has expired.");
      return;
    }

    const validation = passwordResetSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Partial<Record<keyof PasswordResetInput, string>> = {};
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof PasswordResetInput;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      const result = await authClient.resetPassword({
        newPassword: formData.password,
        token,
      });
      if (result.error) {
        toast.error(
          result.error.message ||
            "Could not reset password. The link may have expired.",
        );
        setIsLoading(false);
        return;
      }
      setDone(true);
    } catch (err) {
      console.error("Reset password error:", err);
      toast.error("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  // Invalid/missing token — dead-end with a path back to request a new link.
  if (!token || linkError) {
    return (
      <div className="space-y-6 text-center">
        <div className="space-y-1.5">
          <h1 className="font-clash text-2xl font-semibold tracking-tight text-white">
            Link expired
          </h1>
          <p className="text-sm text-white/50">
            This password reset link is invalid or has expired. Request a fresh
            one to continue.
          </p>
        </div>
        <Link
          href="/forgot-password"
          className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#2563eb] text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
        >
          Request new link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full border border-[#2563eb]/30 bg-[#2563eb]/10">
          <CheckCircle2 className="size-5 text-[#2563eb]" />
        </div>
        <div className="space-y-1.5">
          <h1 className="font-clash text-2xl font-semibold tracking-tight text-white">
            Password updated
          </h1>
          <p className="text-sm text-white/50">
            Your password has been changed. You can now sign in with it.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="h-11 w-full rounded-lg bg-[#2563eb] text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
        >
          Continue to sign in
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="font-clash text-2xl font-semibold tracking-tight text-white">
          New password
        </h1>
        <p className="text-sm text-white/50">
          Choose a new password for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password" className={labelClass}>
            New password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
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

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className={labelClass}>
            Confirm password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange("confirmPassword")}
              disabled={isLoading}
              aria-invalid={!!errors.confirmPassword}
              className={`${inputClass} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-white/70"
              tabIndex={-1}
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-400">{errors.confirmPassword}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="h-11 w-full rounded-lg bg-[#2563eb] text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Updating…" : "Update password"}
        </button>
      </form>

      <Link
        href="/login"
        className="flex items-center justify-center gap-1.5 text-sm text-white/40 transition-colors hover:text-white"
      >
        <ArrowLeft className="size-4" />
        Back to sign in
      </Link>
    </div>
  );
}
