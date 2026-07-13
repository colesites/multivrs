"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { authClient } from "@/lib/auth-client";

const OTP_LENGTH = 6;

/**
 * Email verification via 6-digit OTP (Better Auth `emailOTP` plugin). The email
 * is passed through as a query param; the code was sent on sign-up.
 */
export function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const verify = async (code: string) => {
    if (!email) {
      toast.error("Missing email address. Please sign in again.");
      return;
    }
    setIsVerifying(true);
    const { error } = await authClient.emailOtp.verifyEmail({
      email,
      otp: code,
    });
    if (error) {
      toast.error(error.message || "Invalid or expired code. Try again.");
      setOtp("");
      setIsVerifying(false);
      return;
    }
    toast.success("Email verified.");
    router.push("/dashboard");
  };

  const handleChange = (value: string) => {
    setOtp(value);
    if (value.length === OTP_LENGTH && !isVerifying) {
      void verify(value);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("Missing email address. Please sign in again.");
      return;
    }
    setIsResending(true);
    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: "email-verification",
    });
    setIsResending(false);
    if (error) {
      toast.error(error.message || "Could not resend the code.");
      return;
    }
    toast.success("A new code is on its way.");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="font-clash text-2xl font-semibold tracking-tight text-white">
          Verify your email
        </h1>
        <p className="text-sm text-white/50">
          Enter the 6-digit code we sent to{" "}
          <span className="text-white/80">{email || "your email"}</span>.
        </p>
      </div>

      <div className="flex flex-col items-center gap-4">
        <InputOTP
          maxLength={OTP_LENGTH}
          value={otp}
          onChange={handleChange}
          disabled={isVerifying}
          autoFocus
        >
          <InputOTPGroup className="gap-2">
            {Array.from({ length: OTP_LENGTH }).map((_, i) => (
              <InputOTPSlot
                // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length OTP slots
                key={i}
                index={i}
                className="size-12 rounded-lg border-white/10 bg-white/[0.03] text-lg text-white first:rounded-l-lg last:rounded-r-lg data-[active=true]:border-[#2563eb] data-[active=true]:ring-[#2563eb]/30"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>

        {isVerifying && (
          <p className="font-mono text-[11px] uppercase tracking-widest text-white/40">
            Verifying…
          </p>
        )}
      </div>

      <div className="space-y-3 text-center">
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending}
          className="text-sm text-white/40 transition-colors hover:text-[#2563eb] disabled:opacity-50"
        >
          {isResending ? "Sending…" : "Didn't get it? Resend code"}
        </button>

        <Link
          href="/login"
          className="flex items-center justify-center gap-1.5 text-sm text-white/40 transition-colors hover:text-white"
        >
          <ArrowLeft className="size-4" />
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
