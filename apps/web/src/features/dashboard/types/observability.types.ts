import type {
  AnalyticsPoint,
  AnalyticsRange,
} from "@/features/dashboard/types/analytics.types";

export interface ObservabilityData {
  activeDeployments: number;
  averageLatency: number;
  bandwidthBytes: number;
  errorDeployments: number;
  errorRate: number;
  recentErrors: Array<{
    createdAt: string;
    deploymentId: string;
    message: string;
  }>;
  requests: number;
  range: AnalyticsRange;
  series: AnalyticsPoint[];
  state: "ready" | "unconfigured" | "error";
}
