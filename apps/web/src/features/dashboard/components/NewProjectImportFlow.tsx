"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import SpecularButton from "@/components/SpecularButton";
import { BuildSettingsFields } from "@/features/dashboard/components/BuildSettingsFields";
import { DeploymentProgress } from "@/features/dashboard/components/DeploymentProgress";
import { EnvironmentDraftEditor } from "@/features/dashboard/components/EnvironmentDraftEditor";
import { ProjectImportBasics } from "@/features/dashboard/components/ProjectImportBasics";
import { useDeploymentImport } from "@/features/dashboard/hooks/useDeploymentImport";
import type {
  DeploymentImportConfig,
  RepositorySource,
} from "@/features/dashboard/types/deployment-import.types";

export function NewProjectImportFlow() {
  const search = useSearchParams();
  const source: RepositorySource = {
    branch: search.get("branch") || "main",
    name: search.get("name") || "repository",
    owner: search.get("owner") || "github",
    team: search.get("teamSlug") || search.get("owner") || "dashboard",
    url: search.get("s") || "",
  };
  const [config, setConfig] = useState<DeploymentImportConfig>({
    buildCommand: "",
    environment: [{ id: "initial", key: "", value: "" }],
    framework: "nextjs",
    installCommand: "",
    outputDirectory: "",
    projectName: source.name,
    rootDirectory: ".",
  });
  const [buildOpen, setBuildOpen] = useState(false);
  const [environmentOpen, setEnvironmentOpen] = useState(false);
  const deployment = useDeploymentImport(source);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 font-sans text-white">
      <section className="rounded-2xl border border-white/10 bg-[#09090b] p-6 shadow-2xl">
        <h1 className="text-xl font-semibold tracking-tight">
          Configure project
        </h1>
        <ProjectImportBasics
          config={config}
          onChange={setConfig}
          source={source}
        />
        <div className="mt-5 space-y-3">
          <BuildSettingsFields
            config={config}
            onChange={setConfig}
            open={buildOpen}
            onToggle={() => setBuildOpen((value) => !value)}
          />
          <EnvironmentDraftEditor
            config={config}
            onChange={setConfig}
            open={environmentOpen}
            onToggle={() => setEnvironmentOpen((value) => !value)}
          />
        </div>
        <SpecularButton
          size="lg"
          tint="#ffffff"
          tintOpacity={0.95}
          lineColor="#ffffff"
          baseColor="#ffffff"
          textColor="#000000"
          onClick={() => deployment.deploy(config)}
          disabled={deployment.deploying || !source.url}
          className="mt-6 h-11! w-full! text-xs! font-semibold"
        >
          {deployment.deploying ? (
            <span className="flex items-center gap-2">
              <Loader2 className="size-4 animate-spin" /> Deploying
            </span>
          ) : (
            "Deploy"
          )}
        </SpecularButton>
      </section>
      <DeploymentProgress
        cancel={deployment.cancel}
        deploying={deployment.deploying}
        detailsUrl={deployment.detailsUrl}
        logs={deployment.logs}
        seconds={deployment.seconds}
        status={deployment.status}
      />
      <Link
        href="/new"
        className="mt-8 block text-center text-xs text-white/40 hover:text-white"
      >
        Import a different repository →
      </Link>
    </div>
  );
}
