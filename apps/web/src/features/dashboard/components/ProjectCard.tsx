import {
  CircleAlert,
  CircleCheck,
  CircleDashed,
  GitBranch,
  LoaderCircle,
  Rocket,
} from "lucide-react";
import Link from "next/link";
import { ProjectCardActions } from "@/features/dashboard/components/ProjectCardActions";
import { ProjectFavicon } from "@/features/dashboard/components/ProjectFavicon";
import type {
  DashboardProject,
  ProjectStatus,
} from "@/features/dashboard/types/project.types";
import { cn } from "@/lib/utils";

const STATUS: Record<
  ProjectStatus,
  {
    icon: typeof CircleCheck;
    label: string;
    className: string;
  }
> = {
  idle: {
    icon: CircleDashed,
    label: "No deployments",
    className: "text-muted-foreground",
  },
  ready: {
    icon: CircleCheck,
    label: "Ready",
    className: "text-blue-400",
  },
  building: {
    icon: LoaderCircle,
    label: "Building",
    className: "animate-spin text-amber-400",
  },
  error: {
    icon: CircleAlert,
    label: "Deployment failed",
    className: "text-red-400",
  },
};

interface ProjectCardProps {
  project: DashboardProject;
  href: string;
}

export function ProjectCard({ project, href }: ProjectCardProps) {
  const deploymentHref = project.latestDeployment
    ? `${href}/deployments/${project.latestDeployment.id}`
    : null;
  const status = STATUS[project.status];
  const StatusIcon = status.icon;

  return (
    <article className="group rounded-xl border border-[var(--hairline)] bg-[var(--ink-raised)]/65 p-4 transition-colors hover:border-[var(--hairline-strong)] hover:bg-[var(--ink-raised)]/85">
      <div className="flex items-start gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-black ring-1 ring-white/5">
          <ProjectFavicon name={project.name} url={project.faviconUrl} />
        </span>

        <div className="min-w-0 flex-1">
          <Link
            className="block w-fit max-w-full truncate text-[15px] font-semibold tracking-tight text-foreground hover:underline"
            href={href}
          >
            {project.name}
          </Link>
          {project.siteUrl && project.siteLabel ? (
            <a
              className="mt-0.5 block w-fit max-w-full truncate text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline"
              href={project.siteUrl}
              rel="noreferrer"
              target="_blank"
            >
              {project.siteLabel}
            </a>
          ) : (
            <span className="mt-0.5 block text-sm text-muted-foreground">
              No deployments yet
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <span
            aria-label={status.label}
            className="flex size-8 items-center justify-center rounded-full border border-[var(--hairline)] bg-black/20"
            role="img"
            title={status.label}
          >
            <StatusIcon className={cn("size-[18px]", status.className)} />
          </span>
          <ProjectCardActions
            href={href}
            projectId={project.id}
            projectName={project.name}
          />
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {project.latestDeployment && deploymentHref ? (
          <Link
            className="flex min-w-0 items-center gap-2 text-sm text-foreground/90 hover:underline"
            href={deploymentHref}
          >
            <Rocket className="size-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate">{project.latestDeployment.label}</span>
            <span className="ml-auto flex shrink-0 items-center gap-1 font-geist-mono text-[11px] text-muted-foreground">
              <GitBranch className="size-3" />
              {project.latestDeployment.branch}
            </span>
          </Link>
        ) : null}

        <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
          <GitHubMark className="size-3.5 shrink-0" />
          {project.repositoryUrl && project.repositoryLabel ? (
            <a
              className="truncate transition-colors hover:text-foreground hover:underline"
              href={project.repositoryUrl}
              rel="noreferrer"
              target="_blank"
            >
              {project.repositoryLabel}
            </a>
          ) : (
            <span className="truncate">Repository unavailable</span>
          )}
          {project.latestDeployment ? (
            <time className="ml-auto shrink-0 text-xs">
              {project.latestDeployment.createdAt}
            </time>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function GitHubMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="currentColor"
      viewBox="0 0 24 24"
    >
      <path d="M12 .7A11.5 11.5 0 0 0 8.4 23c.6.1.8-.3.8-.6v-2.2c-3.4.7-4.1-1.4-4.1-1.4-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A11.5 11.5 0 0 0 12 .7Z" />
    </svg>
  );
}
