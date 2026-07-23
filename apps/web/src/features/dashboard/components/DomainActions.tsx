"use client";

import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DomainActionsProps {
  domainId: string;
  detailUrl: string;
  hostname: string;
}

export function DomainActions({
  domainId,
  detailUrl,
  hostname,
}: DomainActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function verify() {
    startTransition(async () => {
      const response = await fetch(`/api/domains/${domainId}/verify`, {
        method: "POST",
      });
      if (!response.ok) {
        toast.error("Unable to check domain configuration");
        return;
      }
      const body = (await response.json()) as { verified?: boolean };
      if (body.verified) {
        toast.success(`${hostname} is verified`);
        router.refresh();
      } else {
        toast.error("Verification record has not propagated yet");
      }
    });
  }

  function remove() {
    if (!window.confirm(`Remove ${hostname} from Multivrs?`)) return;
    startTransition(async () => {
      const response = await fetch(`/api/domains/${domainId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        toast.error("Unable to remove domain");
        return;
      }
      toast.success(`${hostname} removed`);
      router.refresh();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          title="Domain actions"
          disabled={pending}
        >
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => router.push(detailUrl)}>
          View DNS
        </DropdownMenuItem>
        <DropdownMenuItem onClick={verify}>
          Verify configuration
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive" onClick={remove}>
          Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
