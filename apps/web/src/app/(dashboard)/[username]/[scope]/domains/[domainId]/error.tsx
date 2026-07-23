"use client";

import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DomainDnsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto grid min-h-[60vh] max-w-xl place-items-center px-5 text-center">
      <div>
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-amber-400/10 text-amber-300">
          <AlertTriangle className="size-5" />
        </div>
        <h1 className="mt-5 text-lg font-semibold">
          DNS configuration unavailable
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Multivrs could not load this domain’s authoritative DNS zone. Check
          the Openprovider configuration and try again.
        </p>
        <Button className="mt-5" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  );
}
