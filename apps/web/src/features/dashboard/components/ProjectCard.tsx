import { GitBranch, MoreHorizontal, Activity, Zap } from "lucide-react";
import Link from "next/link";
import type {
  DashboardProject,
  ProjectStatus,
} from "@/features/dashboard/types/project.types";
import { cn } from "@/lib/utils";

const STATUS: Record<ProjectStatus, { dot: string; label: string }> = {
  ready: { dot: "bg-[var(--accent)]", label: "Ready" },
  building: { dot: "bg-amber-400 animate-pulse", label: "Building" },
  error: { dot: "bg-red-500", label: "Error" },
};

interface ProjectCardProps {
  project: DashboardProject;
  href: string;
}

export function ProjectCard({ project, href }: ProjectCardProps) {
  const status = STATUS[project.status];
  const initial = project.name[0]?.toUpperCase() ?? "P";
  
  // Fake analytics fallback if not provided
  const visits = project.analytics?.pageVisits || "0k";
  const speed = project.analytics?.speedInsightScore || 0;
  const speedColor = speed >= 90 ? "text-emerald-500" : speed >= 50 ? "text-amber-500" : "text-rose-500";

  return (
    <div className="group relative flex flex-col rounded-[16px] border border-[var(--hairline)] bg-[var(--ink-raised)]/70 backdrop-blur-md transition-all hover:border-[var(--hairline-strong)] hover:bg-[var(--ink-raised)]/90 overflow-hidden card-grain">
      
      {/* Top Section */}
      <div className="p-5 flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-[var(--hairline-strong)] bg-white/[0.04] font-geist-mono text-[14px] font-bold text-foreground">
              {initial}
            </span>
            <div className="min-w-0">
              <Link
                href={href}
                className="block truncate text-[14.5px] font-bold tracking-tight text-foreground outline-none after:absolute after:inset-0 hover:underline focus-visible:underline"
              >
                {project.name}
              </Link>
              <div className="flex items-center gap-1.5 mt-0.5 text-[12px] text-muted-foreground/80">
                <span className="truncate">{project.domain}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 relative z-10">
            <span
              className="flex items-center justify-center size-6 rounded-full border border-[var(--hairline)] bg-white/[0.02]"
              title={status.label}
            >
              <span className={cn("size-2 rounded-full", status.dot)} />
            </span>
            <button
              type="button"
              aria-label="Project options"
              className="flex items-center justify-center size-6 rounded-md text-muted-foreground/50 transition-all hover:bg-white/[0.05] hover:text-foreground"
            >
              <MoreHorizontal className="size-4" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Repository info */}
        <div className="flex items-center gap-1.5 text-[11.5px] font-mono text-foreground/80 bg-white/[0.03] border border-[var(--hairline)] rounded-md px-2 py-1 w-fit">
          <svg
            className="size-3.5 opacity-80"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="none"
            aria-hidden="true"
          >
            <title>GitHub repository icon</title>
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          {project.repo}
        </div>

        {/* Commit & Branch info */}
        <div className="flex flex-col gap-1.5 mt-1">
          <p className="line-clamp-1 text-[13px] text-foreground/90 font-medium">
            {project.commitMessage}
          </p>
          <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground/70">
            <span>{project.updatedAt}</span>
            <span>on</span>
            <span className="flex items-center gap-1 font-mono text-[11px] text-foreground/70">
              <GitBranch className="size-3" />
              {project.branch}
            </span>
          </div>
        </div>
      </div>

      {/* Mini Analytics Footer */}
      <div className="flex items-center justify-between border-t border-[var(--hairline)] bg-black/20 px-5 py-3">
         <div className="flex items-center gap-5">
           {/* Visits */}
           <div className="flex items-center gap-1.5" title="Page Visits (Last 30d)">
              <Activity className="size-3.5 text-blue-400" />
              <span className="text-[12px] font-bold text-foreground/80">{visits}</span>
           </div>
           
           {/* Speed Insights */}
           <div className="flex items-center gap-1.5" title="Speed Insight Score">
              <Zap className={cn("size-3.5", speedColor)} fill="currentColor" fillOpacity={0.2} />
              <span className="text-[12px] font-bold text-foreground/80">{speed || "—"}</span>
           </div>
         </div>
      </div>
    </div>
  );
}
