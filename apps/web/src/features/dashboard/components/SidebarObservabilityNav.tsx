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

export function SidebarObservabilityNav({ 
  onLinkClick,
  onBack,
}: { 
  onLinkClick?: () => void;
  onBack?: () => void;
} = {}) {
  const { username, scope } = useDashboardScope();
  const searchParams = useSearchParams();
  const activeView = searchParams.get("view") ?? "overview";
  const backHref = scope === "~" ? `/${username}` : `/${username}/${scope}`;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="px-3 pb-1 pt-2">
        {onBack ? (
          <button
            type="button"
            className="group flex w-full h-9 items-center gap-3 rounded-lg px-3 text-[13px] text-muted-foreground transition-colors hover:bg-white/2.5 hover:text-foreground"
            onClick={onBack}
          >
            <ArrowLeft
              className="size-4.25 transition-transform group-hover:-translate-x-0.5"
              strokeWidth={1.75}
            />
            <span className="font-medium">Observability</span>
          </button>
        ) : (
          <Link
            className="group flex h-9 items-center gap-3 rounded-lg px-3 text-[13px] text-muted-foreground transition-colors hover:bg-white/2.5 hover:text-foreground"
            href={backHref}
          >
            <ArrowLeft
              className="size-4.25 transition-transform group-hover:-translate-x-0.5"
              strokeWidth={1.75}
            />
            <span className="font-medium">Observability</span>
          </Link>
        )}
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
                    "nav-item group flex h-9 items-center gap-3 rounded-lg px-3 text-[13px] transition-colors duration-150",
                    isActive
                      ? "nav-rail-active bg-white/8 font-medium text-foreground"
                      : "text-muted-foreground hover:bg-white/2.5 hover:text-foreground",
                  )}
                  href={`/${username}/${scope}/observability?view=${item.view}`}
                  onClick={() => onLinkClick?.()}
                >
                  <item.icon
                    className={cn(
                      "size-4.25 shrink-0 transition-colors",
                      isActive
                        ? "text-foreground"
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
