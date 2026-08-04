import type { Env } from "./types";

export type UsageMetric =
  | "blob_data_transfer"
  | "blob_simple_operations"
  | "edge_config_reads"
  | "fast_origin_transfer"
  | "function_duration_ms"
  | "function_invocations"
  | "image_cache_reads"
  | "image_cache_writes"
  | "image_transformations"
  | "isr_reads"
  | "isr_writes"
  | "microfrontend_routing"
  | "workflow_data_written_bytes";

export function recordUsage(
  env: Env,
  projectId: string,
  metric: UsageMetric,
  quantity = 1,
  dimensions: string[] = [],
): void {
  env.USAGE_ANALYTICS?.writeDataPoint({
    blobs: [metric, ...dimensions.slice(0, 5)],
    doubles: [quantity],
    indexes: [projectId],
  });
}
