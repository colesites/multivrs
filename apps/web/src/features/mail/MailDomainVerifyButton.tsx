"use client";

import { CheckCircle2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";

const verificationResponseSchema = z.object({
  status: z.string(),
  verified: z.boolean(),
});

const errorResponseSchema = z.object({
  error: z.object({ message: z.string() }),
});

export function MailDomainVerifyButton({
  domainId,
  verified,
}: {
  domainId: string;
  verified: boolean;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(false);

  async function verify() {
    setChecking(true);
    try {
      const response = await fetch(`/api/mail/domains/${domainId}/verify`, {
        method: "POST",
      });
      const body: unknown = await response.json();
      if (!response.ok) {
        const error = errorResponseSchema.safeParse(body);
        toast.error(
          error.success ? error.data.error.message : "DNS verification failed",
        );
        return;
      }
      const result = verificationResponseSchema.parse(body);
      if (result.verified) {
        toast.success("Sending domain verified");
      } else if (result.status === "failed") {
        toast.error("Some DNS records are incorrect or missing");
      } else {
        toast.info(
          "Verification is in progress. Check again in a few minutes.",
        );
      }
      router.refresh();
    } catch {
      toast.error("Unable to reach the mail verification service");
    } finally {
      setChecking(false);
    }
  }

  return (
    <Button disabled={checking} onClick={verify} variant="outline">
      {verified ? (
        <CheckCircle2 className="size-4" />
      ) : (
        <RefreshCw className={checking ? "size-4 animate-spin" : "size-4"} />
      )}
      {checking ? "Refreshing…" : "Refresh now"}
    </Button>
  );
}
