"use client";

import {
  Activity,
  ArrowDownToLine,
  Box,
  Clock3,
  Cpu,
  Database,
  Gauge,
  GitBranch,
  HardDrive,
  ImageIcon,
  type LucideIcon,
  Network,
  RefreshCw,
  Zap,
} from "lucide-react";
import { use } from "react";
import type { AccountUsage } from "@/features/dashboard/types/usage.types";

interface UsageMetric {
  description: string;
  icon: LucideIcon;
  label: string;
  used: string;
}

interface UsageGroup {
  id: string;
  label: string;
  metrics: UsageMetric[];
}

const COMPACT_NUMBER = new Intl.NumberFormat("en", {
  maximumFractionDigits: 1,
  notation: "compact",
});
const PERIOD_DATE = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

function billingPeriodLabel(now = new Date()): string {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0),
  );
  return `${PERIOD_DATE.format(start)} – ${PERIOD_DATE.format(end)}`;
}

function usageGroups(usage: AccountUsage): UsageGroup[] {
  const metric = (name: string) => usage.metrics[name] ?? 0;
  return [
    {
      id: "compute",
      label: "Compute",
      metrics: [
        {
          description: "Measured wall-clock execution time across functions",
          icon: Cpu,
          label: "Function Execution Duration",
          used: duration(metric("function_duration_ms")),
        },
        {
          description: "Invocations across serverless functions",
          icon: Zap,
          label: "Function Invocations",
          used: compact(metric("function_invocations")),
        },
      ],
    },
    {
      id: "networking",
      label: "Networking",
      metrics: [
        {
          description: "Data transferred from your origin",
          icon: ArrowDownToLine,
          label: "Fast Origin Transfer",
          used: bytes(metric("fast_origin_transfer")),
        },
        {
          description: "Requests served from the Multivrs edge",
          icon: Network,
          label: "Edge Requests",
          used: compact(usage.requests),
        },
        {
          description: "Cached and dynamic data delivered globally",
          icon: Gauge,
          label: "Fast Data Transfer",
          used: bytes(usage.bandwidthBytes),
        },
      ],
    },
    {
      id: "builds-sandboxes",
      label: "Builds & sandboxes",
      metrics: [
        {
          description: "Wall-clock time used by standard build machines",
          icon: Clock3,
          label: "Standard Build Minutes",
          used: duration(metric("build_duration_ms_standard")),
        },
        {
          description: "Build cache restored from Multivrs remote storage",
          icon: ArrowDownToLine,
          label: "Remote Cache Downloads",
          used: bytes(metric("build_cache_read_bytes")),
        },
        {
          description: "Build cache published for later deployments",
          icon: HardDrive,
          label: "Remote Cache Uploads",
          used: bytes(metric("build_cache_write_bytes")),
        },
        {
          description: "Ephemeral development environments created this period",
          icon: Box,
          label: "Sandbox Creations",
          used: compact(metric("sandbox_creations")),
        },
        {
          description: "Measured execution time for sandbox commands",
          icon: Cpu,
          label: "Sandbox Command Duration",
          used: duration(metric("sandbox_active_ms")),
        },
        {
          description: "Elapsed time while sandbox resources were provisioned",
          icon: Clock3,
          label: "Sandbox Provisioned Duration",
          used: duration(metric("sandbox_provisioned_ms")),
        },
        {
          description: "Sandboxes currently creating or running",
          icon: Box,
          label: "Concurrent Sandboxes",
          used: compact(metric("concurrent_sandboxes")),
        },
      ],
    },
    {
      id: "workflows",
      label: "Workflows",
      metrics: [
        {
          description: "Durable workflow steps executed this period",
          icon: GitBranch,
          label: "Workflow Steps",
          used: compact(metric("workflow_events")),
        },
        {
          description: "Payload and step-result data written by workflows",
          icon: Database,
          label: "Workflow Data Written",
          used: bytes(metric("workflow_data_written_bytes")),
        },
        {
          description: "Workflow input and output currently retained",
          icon: HardDrive,
          label: "Workflow Data Retained",
          used: bytes(metric("workflow_data_retained_bytes")),
        },
      ],
    },
    {
      id: "images-caching",
      label: "Images & caching",
      metrics: [
        {
          description: "New optimized images written to cache",
          icon: HardDrive,
          label: "Image Optimization — Cache Writes",
          used: compact(metric("image_cache_writes")),
        },
        {
          description: "Optimized images served from cache",
          icon: ImageIcon,
          label: "Image Optimization — Cache Reads",
          used: compact(metric("image_cache_reads")),
        },
        {
          description: "Unique image transformations processed",
          icon: RefreshCw,
          label: "Image Optimization — Transformations",
          used: compact(metric("image_transformations")),
        },
        {
          description: "Incremental pages written to cache",
          icon: Database,
          label: "ISR Writes",
          used: compact(metric("isr_writes")),
        },
        {
          description: "Incremental pages served from cache",
          icon: Activity,
          label: "ISR Reads",
          used: compact(metric("isr_reads")),
        },
      ],
    },
    {
      id: "storage-routing",
      label: "Storage & routing",
      metrics: [
        {
          description: "Bytes currently stored in Multivrs Blob",
          icon: HardDrive,
          label: "Blob Storage Size",
          used: bytes(metric("blob_storage_size")),
        },
        {
          description: "Public and private bytes delivered from Multivrs Blob",
          icon: HardDrive,
          label: "Blob Data Transfer",
          used: bytes(metric("blob_data_transfer")),
        },
        {
          description: "Blob reads served by the Multivrs edge",
          icon: Database,
          label: "Blob Simple Operations",
          used: compact(metric("blob_simple_operations")),
        },
        {
          description: "Blob upload completion and delete operations",
          icon: Database,
          label: "Blob Advanced Operations",
          used: compact(metric("blob_advanced_operations")),
        },
        {
          description: "Low-latency configuration reads at the edge",
          icon: Zap,
          label: "Edge Config Reads",
          used: compact(metric("edge_config_reads")),
        },
        {
          description: "Configuration values currently published to the edge",
          icon: Zap,
          label: "Edge Config Entries",
          used: compact(metric("edge_config_entries")),
        },
        {
          description:
            "Configuration values written during this billing period",
          icon: Zap,
          label: "Edge Config Writes",
          used: compact(metric("edge_config_writes")),
        },
        {
          description: "Enabled redirects currently published to the edge",
          icon: Network,
          label: "Bulk Redirects",
          used: compact(metric("bulk_redirects")),
        },
        {
          description: "Requests dispatched across mounted projects",
          icon: Network,
          label: "Microfrontend Routing",
          used: compact(metric("microfrontend_routing")),
        },
        {
          description: "Enabled project mounts currently published to the edge",
          icon: Network,
          label: "Microfrontend Mounts",
          used: compact(metric("microfrontend_mounts")),
        },
      ],
    },
  ];
}

export function UsageView({ usage }: { usage: Promise<AccountUsage> }) {
  const resolvedUsage = use(usage);
  const groups = usageGroups(resolvedUsage);
  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-5 border-b border-[var(--hairline)] pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-geist-mono text-[10px] uppercase tracking-[0.18em] text-blue-400">
            Multivrs usage
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            Your resources, at a glance
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Track compute, network, image, and cache consumption across every
            project.
          </p>
        </div>
        <div className="flex items-center gap-3 font-geist-mono text-[11px] text-muted-foreground">
          <span className="size-1.5 rounded-full bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.8)]" />
          {billingPeriodLabel()}
        </div>
      </header>

      <div className="space-y-9">
        {groups.map((group) => (
          <section key={group.id} aria-labelledby={`usage-${group.id}`}>
            <div className="mb-3 flex items-center justify-between border-b border-[var(--hairline)] pb-3">
              <h3
                id={`usage-${group.id}`}
                className="font-geist-mono text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground"
              >
                {group.label}
              </h3>
              <span className="font-geist-mono text-[10px] text-muted-foreground/60">
                Current billing period
              </span>
            </div>
            <div>
              {group.metrics.map((metric) => (
                <UsageRow key={metric.label} metric={metric} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="border-t border-[var(--hairline)] pt-5 text-xs leading-5 text-muted-foreground">
        Values are measured by the Multivrs edge and aggregated for this billing
        period. Pricing and plan limits are intentionally not shown until they
        are configured.
      </p>
    </div>
  );
}

function compact(value: number): string {
  return COMPACT_NUMBER.format(value);
}

function bytes(value: number): string {
  if (value < 1024) return `${Math.round(value)} B`;
  if (value < 1024 ** 2) return `${(value / 1024).toFixed(1)} KB`;
  if (value < 1024 ** 3) return `${(value / 1024 ** 2).toFixed(1)} MB`;
  return `${(value / 1024 ** 3).toFixed(2)} GB`;
}

function duration(milliseconds: number): string {
  if (milliseconds < 1_000) return `${Math.round(milliseconds)} ms`;
  if (milliseconds < 60_000) return `${(milliseconds / 1_000).toFixed(1)} s`;
  return `${(milliseconds / 60_000).toFixed(1)} min`;
}

function UsageRow({ metric }: { metric: UsageMetric }) {
  const Icon = metric.icon;

  return (
    <article className="group flex items-center gap-4 border-b border-[var(--hairline)] px-3 py-5 transition-colors last:border-b-0 hover:bg-white/[0.018] sm:px-4">
      <span className="flex size-10 shrink-0 items-center justify-center border border-[var(--hairline)] text-blue-400 transition-colors group-hover:border-blue-400/25 group-hover:bg-blue-400/[0.04]">
        <Icon className="size-[18px]" strokeWidth={1.7} />
      </span>
      <div className="min-w-0 flex-1">
        <h4 className="text-[15px] font-medium tracking-tight text-foreground">
          {metric.label}
        </h4>
        <p className="mt-1 text-sm leading-5 text-muted-foreground">
          {metric.description}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="font-geist-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground/50">
          Used
        </p>
        <p className="mt-1 font-geist-mono text-base font-semibold tabular-nums text-foreground sm:text-lg">
          {metric.used}
        </p>
      </div>
    </article>
  );
}
