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

async function requestDomainVerification(domainId: string) {
  const response = await fetch(`/api/mail/domains/${domainId}/verify`, {
    method: "POST",
  });
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const error = errorResponseSchema.safeParse(body);
    throw new Error(
      error.success ? error.data.error.message : "DNS verification failed",
    );
  }
  return verificationResponseSchema.parse(await response.json());
}

export function MailDomainVerifyButton({
  domainId,
  verified,
}: {
  domainId: string;
  verified: boolean;
}) {
  const router = useRouter();
  const [checking, setChecking] = useState(false);

  function verify() {
    setChecking(true);
    void requestDomainVerification(domainId)
      .then((result) => {
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
      })
      .catch((error: unknown) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to reach the mail verification service",
        );
      })
      .then(() => setChecking(false));
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
