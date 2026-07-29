"use client";

import {
  Activity,
  ArrowLeft,
  Boxes,
  Cloud,
  Earth,
  FileUp,
  Globe2,
  ImageIcon,
  LayoutGrid,
  Network,
  NotebookTabs,
  ScanLine,
  SearchCode,
  Send,
  Sparkles,
  SquareFunction,
  SquareM,
  TriangleAlert,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useDashboardScope } from "@/features/dashboard/lib/useDashboardScope";
import { cn } from "@/lib/utils";

const OBSERVABILITY_NAVIGATION = [
  { label: "Overview", view: "overview", icon: LayoutGrid },
  { label: "Query", view: "query", icon: Activity },
  { label: "Notebooks", view: "notebooks", icon: NotebookTabs },
  { label: "Alerts", view: "alerts", icon: TriangleAlert },
  { divider: "Compute" },
  { label: "Functions", view: "functions", icon: SquareFunction },
  { label: "Agent Runs", view: "agent-runs", icon: Workflow },
  { label: "Sandboxes", view: "sandboxes", icon: ScanLine },
  { label: "External APIs", view: "external-apis", icon: Earth },
  { label: "Middleware", view: "middleware", icon: SquareM },
  { divider: "CDN" },
  { label: "Edge Requests", view: "edge-requests", icon: Globe2 },
  { label: "ISR", view: "isr", icon: FileUp },
  {
    label: "Fast Data Transfer",
    view: "fast-data-transfer",
    icon: Network,
  },
  {
    label: "Image Optimization",
    view: "image-optimization",
    icon: ImageIcon,
  },
  { label: "External Origins", view: "external-origins", icon: SearchCode },
  { label: "Microfrontends", view: "microfrontends", icon: Boxes },
  { divider: "Services" },
  { label: "AI", view: "ai", icon: Sparkles },
  { label: "Blob", view: "blob", icon: Cloud },
  { label: "Queues", view: "queues", icon: Send },
] as const;

export function SidebarObservabilityNav() {
  const { username, scope } = useDashboardScope();
  const searchParams = useSearchParams();
  const activeView = searchParams.get("view") ?? "overview";
  const backHref = scope === "~" ? `/${username}` : `/${username}/${scope}`;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="px-3 pb-1 pt-2">
        <Link
          className="group flex h-9 items-center gap-3 rounded-lg px-3 text-[13px] text-muted-foreground transition-colors hover:bg-white/[0.025] hover:text-foreground"
          href={backHref}
        >
          <ArrowLeft
            className="size-[17px] transition-transform group-hover:-translate-x-0.5"
            strokeWidth={1.75}
          />
          <span className="font-medium">Observability</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 pb-3 hide-scrollbar">
        <ul className="flex flex-col gap-0.5">
          {OBSERVABILITY_NAVIGATION.map((item) => {
            if ("divider" in item) {
              return (
                <li key={item.divider}>
                  <p className="mb-1 mt-4 px-3 font-geist-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground/45">
                    {item.divider}
                  </p>
                </li>
              );
            }

            const Icon = item.icon;
            const isActive = activeView === item.view;
            return (
              <li key={item.view}>
                <Link
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group relative flex h-9 w-full items-center gap-3 rounded-lg px-3 text-[13px] transition-colors duration-150",
                    isActive
                      ? "nav-rail-active bg-accent/12 font-medium text-foreground"
                      : "text-muted-foreground hover:bg-white/[0.025] hover:text-foreground",
                  )}
                  href={`/${username}/${scope}/observability?view=${item.view}`}
                >
                  <Icon
                    className={cn(
                      "size-[17px] shrink-0 transition-colors",
                      isActive
                        ? "text-accent"
                        : "text-muted-foreground/70 group-hover:text-foreground",
                    )}
                    strokeWidth={1.75}
                  />
                  <span className="truncate tracking-[-0.01em]">
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
