"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import SpecularButton from "@/components/SpecularButton";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { AssignDomainNameStep } from "@/features/dashboard/components/AssignDomainNameStep";
import { AssignDomainTargetStep } from "@/features/dashboard/components/AssignDomainTargetStep";
import type { DomainProjectOption } from "@/lib/services/domain.service";

interface AssignDomainProjectDialogProps {
  domainId: string;
  hostname: string;
  projects?: DomainProjectOption[];
}

export function AssignDomainProjectDialog({
  domainId,
  hostname,
  projects = [],
}: AssignDomainProjectDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [subdomain, setSubdomain] = useState("");
  const [projectId, setProjectId] = useState(projects[0]?.id ?? "");
  const [projectSearch, setProjectSearch] = useState("");
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const fullDomain = subdomain ? `${subdomain}.${hostname}` : hostname;
  const selectedProject = projects.find((project) => project.id === projectId);

  function reset() {
    setStep(1);
    setSubdomain("");
    setProjectSearch("");
    setProjectDropdownOpen(false);
    setOpen(false);
  }

  function submit() {
    if (!projectId) return;
    startTransition(async () => {
      const response = await fetch(`/api/domains/${domainId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      if (!response.ok) {
        toast.error(`Unable to connect ${fullDomain}`);
        return;
      }
      toast.success(
        `${fullDomain} connected to ${selectedProject?.name ?? "project"}`,
      );
      reset();
      router.refresh();
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => (value ? setOpen(true) : reset())}
    >
      <SpecularButton
        size="sm"
        tint="#ffffff"
        tintOpacity={0.9}
        lineColor="#ffffff"
        baseColor="#ffffff"
        textColor="#000000"
        onClick={() => setOpen(true)}
      >
        Connect
      </SpecularButton>
      <DialogContent className="max-w-md rounded-2xl border border-white/10 bg-[#09090b] p-6 text-white shadow-2xl">
        {step === 1 ? (
          <AssignDomainNameStep
            fullDomain={fullDomain}
            hostname={hostname}
            subdomain={subdomain}
            onCancel={reset}
            onContinue={() => {
              setProjectId((current) => current || projects[0]?.id || "");
              setStep(2);
            }}
            onSubdomainChange={(value) =>
              setSubdomain(value.toLowerCase().trim())
            }
          />
        ) : (
          <AssignDomainTargetStep
            fullDomain={fullDomain}
            pending={pending}
            projectId={projectId}
            projectSearch={projectSearch}
            projects={projects}
            selectedProject={selectedProject}
            dropdownOpen={projectDropdownOpen}
            onBack={() => setStep(1)}
            onDropdownChange={setProjectDropdownOpen}
            onProjectChange={(id) => {
              setProjectId(id);
              setProjectDropdownOpen(false);
            }}
            onSearchChange={setProjectSearch}
            onSubmit={submit}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
