export interface AnalyticsPoint {
  label: string;
  latency: number;
  requests: number;
}

export interface AnalyticsBreakdownItem {
  label: string;
  requests: number;
}

export interface PlatformAnalytics {
  averageLatency: number;
  bandwidthBytes: number;
  errorRate: number;
  requests: number;
  series: AnalyticsPoint[];
  paths: AnalyticsBreakdownItem[];
  countries: AnalyticsBreakdownItem[];
  state: "ready" | "unconfigured" | "error";
}

export interface WebVitalMetric {
  goodRate: number;
  name: "CLS" | "INP" | "LCP" | "TTFB";
  samples: number;
  value: number;
}

export interface WebVitalsData {
  metrics: WebVitalMetric[];
  state: "ready" | "unconfigured" | "error";
}
