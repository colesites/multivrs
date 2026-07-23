"use client";

import { ArrowRight, LoaderCircle, Orbit } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function DomainDnsSetup({
  hostname,
  onEnable,
}: {
  hostname: string;
  onEnable: () => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <section className="relative overflow-hidden rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.035] p-6">
      <div className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-cyan-400/8 blur-3xl" />
      <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div className="flex gap-4">
          <div className="grid size-11 shrink-0 place-items-center rounded-2xl border border-cyan-300/15 bg-black/25 text-cyan-300 shadow-[inset_0_1px_rgba(255,255,255,.08)]">
            <Orbit className="size-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-cyan-300/70">
              DNS zone not provisioned
            </p>
            <h2 className="mt-1 text-base font-medium">Enable Multivrs DNS</h2>
            <p className="mt-2 max-w-xl text-xs leading-5 text-muted-foreground">
              Create an authoritative zone for {hostname}. If the domain is
              registered through Openprovider, its nameservers will be assigned
              automatically.
            </p>
          </div>
        </div>
        <Button
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              try {
                await onEnable();
                toast.success("DNS zone enabled");
              } catch (error) {
                toast.error(
                  error instanceof Error
                    ? error.message
                    : "Unable to enable DNS",
                );
              }
            })
          }
        >
          {pending ? <LoaderCircle className="animate-spin" /> : <ArrowRight />}
          {pending ? "Provisioning…" : "Enable DNS"}
        </Button>
      </div>
    </section>
  );
}
