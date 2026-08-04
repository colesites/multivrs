export interface AnalyticsPoint {
  bandwidthBytes: number;
  errors: number;
  label: string;
  latency: number;
  pageviews: number;
  requests: number;
}

export interface AnalyticsBreakdownItem {
  label: string;
  requests: number;
}

export interface PlatformAnalytics {
  averageLatency: number;
  bandwidthBytes: number;
  bounceRate: number;
  errorRate: number;
  devices: AnalyticsBreakdownItem[];
  pageviews: number;
  range: AnalyticsRange;
  referrers: AnalyticsBreakdownItem[];
  requests: number;
  sessions: number;
  series: AnalyticsPoint[];
  sources: AnalyticsBreakdownItem[];
  visitors: number;
  paths: AnalyticsBreakdownItem[];
  countries: AnalyticsBreakdownItem[];
  state: "ready" | "unconfigured" | "error" | "locked";
}

export type AnalyticsRange = "24h" | "7d" | "30d";

export interface WebVitalMetric {
  goodRate: number;
  name: "CLS" | "INP" | "LCP" | "TTFB";
  samples: number;
  value: number;
}

export interface WebVitalRoute {
  metrics: Partial<Record<WebVitalMetric["name"], number>>;
  path: string;
  samples: number;
}

export interface WebVitalsData {
  devices: AnalyticsBreakdownItem[];
  metrics: WebVitalMetric[];
  range: AnalyticsRange;
  routes: WebVitalRoute[];
  state: "ready" | "unconfigured" | "error" | "locked";
}
