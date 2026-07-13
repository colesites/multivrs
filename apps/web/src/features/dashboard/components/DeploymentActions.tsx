"use client";

import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { DashboardDeployment } from "./DeploymentsPage";

export function DeploymentActions({
  deployment,
}: {
  deployment: DashboardDeployment;
}) {
  const router = useRouter();
  const [canceling, setCanceling] = useState(false);

  async function cancelDeployment() {
    setCanceling(true);
    try {
      const response = await fetch(
        `/api/projects/${deployment.projectId}/deployments/${deployment.id}/status`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ status: "canceled" }),
        },
      );
      if (!response.ok) throw new Error("Unable to cancel deployment");
      toast.success("Deployment canceled");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to cancel deployment",
      );
    } finally {
      setCanceling(false);
    }
  }

  async function copyUrl() {
    if (!deployment.url) return;
    const url = deployment.url.startsWith("http")
      ? deployment.url
      : `${window.location.origin}${deployment.url}`;
    await navigator.clipboard.writeText(url);
    toast.success("Deployment URL copied");
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Deployment actions"
          className="h-7 w-7 text-muted-foreground/50 opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[180px] border-white/10 bg-background/95"
      >
        <DropdownMenuItem asChild>
          <Link href={deployment.detailsUrl}>View logs</Link>
        </DropdownMenuItem>
        <DropdownMenuItem disabled={!deployment.url} onClick={copyUrl}>
          Copy URL
        </DropdownMenuItem>
        {deployment.status === "Building" ? (
          <DropdownMenuItem
            disabled={canceling}
            onClick={cancelDeployment}
            className="text-rose-400 focus:bg-rose-500/10 focus:text-rose-400"
          >
            {canceling ? "Canceling…" : "Cancel build"}
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
