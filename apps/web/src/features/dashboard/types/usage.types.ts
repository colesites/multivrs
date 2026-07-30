export interface UsagePoint {
  day: string;
  requests: number;
}

export interface AccountUsage {
  averageLatency: number;
  bandwidthBytes: number;
  requests: number;
  series: UsagePoint[];
  metrics: Record<string, number>;
  state: "ready" | "unconfigured" | "error";
}
