"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  createImportProject,
  getImportProgress,
  queueImportDeployment,
} from "@/features/dashboard/lib/deployment-import.client";
import type {
  DeploymentImportConfig,
  RepositorySource,
} from "@/features/dashboard/types/deployment-import.types";
import { useDeploymentTimer } from "@/features/dashboard/hooks/useDeploymentTimer";

export type ImportDeploymentStatus =
  | "idle"
  | "building"
  | "failed"
  | "canceled"
  | "ready";

export function useDeploymentImport(source: RepositorySource) {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const active = useRef<{ deploymentId: string; projectId: string } | null>(
    null,
  );
  const [deploying, setDeploying] = useState(false);
  const [status, setStatus] = useState<ImportDeploymentStatus>("idle");
  const [detailsUrl, setDetailsUrl] = useState<string>();
  const [logs, setLogs] = useState<Array<{ id: string; message: string }>>([]);
  const clock = useDeploymentTimer();
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  async function poll(
    projectId: string,
    deploymentId: string,
    projectSlug: string,
  ) {
    try {
      const progress = await getImportProgress(projectId, deploymentId);
      setLogs(
        progress.logs.map((log) => ({ id: log.id, message: log.message })),
      );
      const deployment = progress.deployment;
      if (deployment.status === "ready") {
        active.current = null;
        setDeploying(false);
        setStatus("ready");
        clock.stop();
        toast.success("Deployment ready");
        router.push(`/${source.team}/${projectSlug}`);
        return;
      }
      if (deployment.status === "error" || deployment.status === "canceled") {
        active.current = null;
        setDeploying(false);
        setStatus(deployment.status === "error" ? "failed" : "canceled");
        clock.stop();
        if (deployment.errorMessage) {
          setLogs((current) =>
            current.some((log) => log.message === deployment.errorMessage)
              ? current
              : [
                  ...current,
                  { id: `failure-${deployment.id}`, message: deployment.errorMessage ?? "" },
                ],
          );
        }
        toast.error(
          deployment.status === "error"
            ? "Deployment failed"
            : "Deployment canceled",
        );
        return;
      }
      timer.current = setTimeout(
        () => poll(projectId, deploymentId, projectSlug),
        1_500,
      );
    } catch (error) {
      setLogs((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          message:
            error instanceof Error ? error.message : "Status update failed",
        },
      ]);
      timer.current = setTimeout(
        () => poll(projectId, deploymentId, projectSlug),
        2_500,
      );
    }
  }

  async function deploy(config: DeploymentImportConfig) {
    if (!config.projectName.trim()) return toast.error("Enter a project name");
    setDeploying(true);
    setStatus("building");
    setDetailsUrl(undefined);
    setLogs([{ id: "queued", message: "Preparing the cloud build…" }]);
    clock.start();
    try {
      const project = await createImportProject(config);
      const deployment = await queueImportDeployment(
        project.id,
        config,
        source,
      );
      active.current = { deploymentId: deployment.id, projectId: project.id };
      setDetailsUrl(
        `/${source.team}/${project.slug}/deployments/${deployment.id}`,
      );
      await poll(project.id, deployment.id, project.slug);
    } catch (error) {
      setDeploying(false);
      setStatus("failed");
      clock.stop();
      setLogs((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          message: error instanceof Error ? error.message : "Deployment failed",
        },
      ]);
      toast.error("Deployment failed");
    }
  }

  async function cancel() {
    const current = active.current;
    if (!current) return;
    const response = await fetch(
      `/api/projects/${current.projectId}/deployments/${current.deploymentId}/status`,
      {
        body: JSON.stringify({ status: "canceled" }),
        headers: { "content-type": "application/json" },
        method: "POST",
      },
    );
    if (!response.ok) {
      toast.error("Could not cancel deployment");
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    active.current = null;
    setDeploying(false);
    setStatus("canceled");
    clock.stop();
    toast.success("Deployment canceled");
  }

  return {
    cancel,
    deploy,
    deploying,
    detailsUrl,
    logs,
    seconds: clock.seconds,
    status,
  };
}
