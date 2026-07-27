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
import { type SignUpInput, signUpSchema } from "@/validators/auth.validators";

const labelClass =
  "font-mono text-[11px] font-medium uppercase tracking-wider text-white/50";
const inputClass =
  "h-11 rounded-lg border-white/10 bg-white/[0.03] text-white placeholder:text-white/30 focus-visible:border-[#2563eb] focus-visible:ring-[#2563eb]/30";

/**
 * Sign-up form: username, email, password, confirm password — plus
 * Google/GitHub OAuth. Mono + blue (#2563eb) styling, no gradients.
 */
export function SignUpForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState<SignUpInput>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof SignUpInput, string>>
  >({});

  const handleChange =
    (field: keyof SignUpInput) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const validation = signUpSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Partial<Record<keyof SignUpInput, string>> = {};
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof SignUpInput;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    void authClient.signUp
      .email({
        email: formData.email,
        password: formData.password,
        name: formData.username,
        username: formData.username,
      })
      .then((result) => {
        setIsLoading(false);
        if (result.error) {
          toast.error(
            result.error.message || "Sign-up failed. Please try again.",
          );
          return;
        }
        toast.success("Account created. Check your email for a code.");
        router.push(
          `/verify-email?email=${encodeURIComponent(formData.email)}`,
        );
      })
      .catch(() => {
        toast.error("An unexpected error occurred. Please try again.");
        setIsLoading(false);
      });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="font-clash text-2xl font-semibold tracking-tight text-white">
          Create account
        </h1>
        <p className="text-sm text-white/50">Start building on Multivrs.</p>
      </div>

      <OAuthButtons />

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
          <Label htmlFor="username" className={labelClass}>
            Username
          </Label>
          <Input
            id="username"
            type="text"
            autoComplete="username"
            placeholder="ada_lovelace"
            value={formData.username}
            onChange={handleChange("username")}
            disabled={isLoading}
            aria-invalid={!!errors.username}
            className={inputClass}
          />
          {errors.username && (
            <p className="text-xs text-red-400">{errors.username}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className={labelClass}>
            Email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
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
          <Label htmlFor="password" className={labelClass}>
            Password
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
          {isLoading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="text-center text-sm text-white/40">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-white transition-colors hover:text-[#2563eb]"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
