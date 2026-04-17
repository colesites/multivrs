"use client";

import { FolderGit2, Plus, GitCommit, ArrowUpRight } from "lucide-react";
import { mockProjects } from "@/lib/mock";
import { cn } from "@/lib/utils";
import { ResourceCard } from "@/features/dashboard";

export default function ProjectsPage() {
  return (
    <div className="space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-[5%] duration-700 ease-out fill-mode-both max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mt-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground tracking-tight">Projects</h2>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">Manage and configure your connected repositories on the Multivrs Edge.</p>
        </div>
        <button className="inline-flex items-center gap-2.5 rounded-2xl bg-foreground px-6 py-3.5 text-sm font-bold text-background hover:bg-foreground/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-[0.98]">
          <Plus className="h-4 w-4 stroke-[3px]" />
          New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {mockProjects.map((project) => (
          <ResourceCard
            key={project.id}
            icon={<FolderGit2 className="h-5 w-5 text-blue-400" />}
            title={project.name}
            subtitle={project.url}
            accentColor="blue"
            badge={project.framework}
            status={{
              label: project.status,
              variant: project.status === "Ready" ? "success" : project.status === "Building" ? "building" : "error",
            }}
            meta={[
              { label: "Last Deployed", value: project.deployedAt },
              { label: "Environment", value: project.environment },
            ]}
            footerLeft={
              <div className="flex items-center gap-3 text-xs text-muted-foreground/50">
                <GitCommit className="h-3.5 w-3.5 text-blue-500/60" />
                <span className="truncate max-w-[180px] italic font-medium">{project.lastCommit}</span>
              </div>
            }
            footerRight={
              <ArrowUpRight className="h-4 w-4 text-muted-foreground/20 group-hover:text-blue-400 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            }
          />
        ))}
      </div>
    </div>
  );
}
