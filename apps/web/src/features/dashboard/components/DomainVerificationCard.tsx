"use client";

import { Check, LoaderCircle, RefreshCw, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DomainVerificationValue } from "@/features/dashboard/components/DomainVerificationValue";
import type { DomainDetail } from "@/lib/domains/dns.types";

interface DomainVerificationCardProps {
  domain: DomainDetail;
  managed: boolean;
  recordPresent: boolean;
  onAddRecord: () => Promise<void>;
}

export function DomainVerificationCard({
  domain,
  managed,
  recordPresent,
  onAddRecord,
}: DomainVerificationCardProps) {
  const router = useRouter();
  const [verifiedResult, setVerifiedResult] = useState<boolean | null>(null);
  const verified = verifiedResult ?? domain.verified;
  const [checking, startChecking] = useTransition();
  const [adding, startAdding] = useTransition();

  function verify() {
    startChecking(async () => {
      const response = await fetch(`/api/domains/${domain.id}/verify`, {
        method: "POST",
      });
      if (!response.ok) {
        toast.error("Unable to check domain ownership");
        return;
      }
      const body = (await response.json()) as { verified?: boolean };
      setVerifiedResult(Boolean(body.verified));
      if (body.verified) {
        toast.success("Domain ownership verified");
        router.refresh();
      } else {
        toast.error("TXT record has not propagated yet");
      }
    });
  }

  return (
    <section className="rounded-2xl border border-white/8 bg-white/[0.025] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex gap-3">
          <div
            className={`mt-0.5 grid size-9 place-items-center rounded-xl ${verified ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-300"}`}
          >
            {verified ? (
              <ShieldCheck className="size-4" />
            ) : (
              <RefreshCw className="size-4" />
            )}
          </div>
          <div>
            <h2 className="text-sm font-medium">
              {verified ? "Ownership verified" : "Verify ownership"}
            </h2>
            <p className="mt-1 max-w-xl text-xs leading-5 text-muted-foreground">
              {verified
                ? "Multivrs can safely attach this hostname to your project."
                : "Publish this TXT record, then check again after DNS propagation."}
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant={verified ? "outline" : "default"}
          onClick={verify}
          disabled={checking}
        >
          {checking ? (
            <LoaderCircle className="animate-spin" />
          ) : verified ? (
            <Check />
          ) : (
            <RefreshCw />
          )}
          {verified ? "Verified" : "Check"}
        </Button>
      </div>
      {!verified ? (
        <div className="mt-5 grid gap-px overflow-hidden rounded-xl border border-white/8 bg-white/8 sm:grid-cols-[1fr_2fr_auto]">
          <DomainVerificationValue label="Type" value="TXT" />
          <DomainVerificationValue
            label="Name"
            value={domain.verificationName}
            copy
          />
          <DomainVerificationValue
            label="Value"
            value={domain.verificationValue}
            copy
          />
          {managed && !recordPresent ? (
            <div className="col-span-full flex justify-end bg-black/20 p-3">
              <Button
                size="sm"
                variant="outline"
                disabled={adding}
                onClick={() =>
                  startAdding(() =>
                    onAddRecord()
                      .then(() => {
                        toast.success("Verification record added");
                      })
                      .catch(() => {
                        toast.error("Unable to add verification record");
                      }),
                  )
                }
              >
                {adding ? "Adding…" : "Add automatically"}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
