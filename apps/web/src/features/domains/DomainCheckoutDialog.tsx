"use client";

import { FlaskConical, LoaderCircle, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckoutPriceRow } from "@/features/domains/CheckoutPriceRow";
import {
  createStripeCheckout,
  placeSandboxOrder,
} from "@/features/domains/domain-checkout-api";
import type { DomainSearchResult } from "@/features/domains/domain-marketplace";
import type { DomainProjectOption } from "@/lib/services/domain.service";

interface DomainCheckoutDialogProps {
  result: DomainSearchResult;
  projects: DomainProjectOption[];
  teamSlug?: string;
  sandboxEnabled: boolean;
  onClose: () => void;
}

export function DomainCheckoutDialog({
  result,
  projects,
  teamSlug,
  sandboxEnabled,
  onClose,
}: DomainCheckoutDialogProps) {
  const router = useRouter();
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [pending, startTransition] = useTransition();
  const project = projects.find((item) => item.id === projectId);

  function submit() {
    startTransition(() =>
      (sandboxEnabled
        ? placeSandboxOrder(result.domain, projectId).then((domainId) => {
            toast.success(`${result.domain} registered in sandbox`);
            onClose();
            if (teamSlug && project) {
              router.push(`/${teamSlug}/${project.slug}/domains/${domainId}`);
            }
            router.refresh();
          })
        : createStripeCheckout(result.domain, projectId).then((checkoutUrl) => {
            window.location.assign(checkoutUrl);
          })
      ).catch((error: unknown) => {
        toast.error(error instanceof Error ? error.message : "Checkout failed");
      }),
    );
  }

  const ready = Boolean(projectId);
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border-cyan-300/20 bg-[#080b10] text-white">
        <DialogHeader>
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-cyan-300">
            {sandboxEnabled ? <FlaskConical className="size-4" /> : null}
            {sandboxEnabled ? "Local domain sandbox" : "Secure checkout"}
          </div>
          <DialogTitle className="font-clash text-2xl">
            Register {result.domain}
          </DialogTitle>
          <DialogDescription>
            {sandboxEnabled
              ? "This creates a local test registration and DNS zone. No payment or real purchase occurs."
              : "Payment is handled by Stripe. Registration starts only after Stripe confirms payment."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 border-y border-white/10 py-5">
          <CheckoutPriceRow result={result} sandbox={sandboxEnabled} />
          <div className="grid gap-2">
            <span className="text-xs text-white/45">Attach to project</span>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger className="w-full border-white/12 bg-white/5">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="flex gap-2 text-xs leading-5 text-white/45">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-300" />
            {sandboxEnabled
              ? "Local sandbox guard enabled. Production registration is blocked."
              : "Your domain is rechecked before payment and registered only after payment confirmation."}
          </p>
          {!projects.length ? (
            <p className="text-xs text-amber-300">
              Sign in and create a project before placing a test order.
            </p>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!ready || pending} onClick={submit}>
            {pending ? <LoaderCircle className="animate-spin" /> : null}
            {pending
              ? sandboxEnabled
                ? "Registering…"
                : "Opening Stripe…"
              : sandboxEnabled
                ? "Place test order"
                : "Continue to payment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
