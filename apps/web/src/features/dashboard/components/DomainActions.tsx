"use client";

import { MoreHorizontal, RefreshCw, Settings, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DomainActionsProps {
  domainId: string;
  detailUrl: string;
  hostname: string;
  initialAutoRenew?: boolean;
}

export function DomainActions({
  domainId,
  detailUrl,
  hostname,
  initialAutoRenew = true,
}: DomainActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [autoRenew, setAutoRenew] = useState(initialAutoRenew);
  const [renewPending, setRenewPending] = useState(false);

  async function toggleAutoRenew(e: React.MouseEvent) {
    e.stopPropagation();
    if (renewPending) return;
    const next = !autoRenew;
    setAutoRenew(next);
    setRenewPending(true);
    try {
      const response = await fetch(`/api/domains/${domainId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ autoRenew: next }),
      });
      if (!response.ok) {
        setAutoRenew(!next);
        setRenewPending(false);
        toast.error("Unable to update auto renewal");
        return;
      }
      setRenewPending(false);
      toast.success(`Auto renewal ${next ? "enabled" : "disabled"}`);
    } catch {
      setAutoRenew(!next);
      setRenewPending(false);
      toast.error("Unable to update auto renewal");
    }
  }

  function remove() {
    if (!window.confirm(`Delete ${hostname} from Multivrs?`)) return;
    startTransition(async () => {
      const response = await fetch(`/api/domains/${domainId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        toast.error("Unable to delete domain");
        return;
      }
      toast.success(`${hostname} deleted`);
      router.refresh();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          title="Domain actions"
          disabled={pending}
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 rounded-2xl border border-white/10 bg-[#09090b]/95 p-1.5 shadow-2xl backdrop-blur-xl"
      >
        <DropdownMenuLabel className="px-3 py-2 text-xs font-normal text-white/50">
          {hostname}
        </DropdownMenuLabel>

        <div className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium text-white/90">
          <div className="flex items-center gap-3">
            <RefreshCw className="size-4 shrink-0 text-white/70" />
            <span>Auto Renewal {autoRenew ? "On" : "Off"}</span>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={autoRenew}
            aria-label={`Turn auto renewal ${autoRenew ? "off" : "on"} for ${hostname}`}
            disabled={renewPending}
            onClick={toggleAutoRenew}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
              autoRenew ? "bg-blue-600" : "bg-white/20"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                autoRenew ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        <DropdownMenuItem
          onClick={() => router.push(detailUrl)}
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-white/90 hover:bg-white/10 cursor-pointer"
        >
          <Settings className="size-4 shrink-0 text-white/70" />
          <span>Configure</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="-mx-1.5 my-1.5 bg-white/10" />
        <DropdownMenuItem
          onClick={remove}
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 hover:text-red-400 cursor-pointer"
        >
          <Trash2 className="size-4 shrink-0 text-red-500" />
          <span>Delete</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
