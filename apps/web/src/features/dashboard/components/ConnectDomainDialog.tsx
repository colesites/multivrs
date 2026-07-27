"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import SpecularButton from "@/components/SpecularButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DomainProjectOption } from "@/lib/services/domain.service";

interface ConnectDomainDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projects: DomainProjectOption[];
}

export function ConnectDomainDialog({
  open,
  onOpenChange,
  projects,
}: ConnectDomainDialogProps) {
  const router = useRouter();
  const [hostname, setHostname] = useState("");
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(() =>
      connectDomain(hostname, projectId)
        .then(() => {
          toast.success(`${hostname} connected`);
          setHostname("");
          onOpenChange(false);
          router.refresh();
        })
        .catch((error: unknown) => {
          toast.error(
            error instanceof Error ? error.message : "Request failed",
          );
        }),
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={submit} className="grid gap-6">
          <DialogHeader>
            <DialogTitle>Connect a domain</DialogTitle>
            <DialogDescription>
              Add a domain you already own, then verify and configure its DNS.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="domain-hostname">Domain</Label>
              <Input
                id="domain-hostname"
                value={hostname}
                onChange={(event) => setHostname(event.target.value)}
                placeholder="example.com"
                autoComplete="off"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Project</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <SpecularButton
              type="submit"
              size="sm"
              tint="#ffffff"
              tintOpacity={0.9}
              lineColor="#ffffff"
              baseColor="#ffffff"
              textColor="#000000"
              disabled={pending || !projectId}
            >
              {pending ? "Connecting…" : "Connect domain"}
            </SpecularButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

async function connectDomain(hostname: string, projectId: string) {
  const response = await fetch("/api/domains", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ hostname, projectId }),
  });
  if (!response.ok) {
    const body = (await response.json()) as { error?: { message?: string } };
    throw new Error(body.error?.message ?? "Unable to connect domain");
  }
}
