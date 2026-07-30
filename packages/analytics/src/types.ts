export type AnalyticsPrimitive = boolean | number | string | null;

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, AnalyticsPrimitive>;
}

export interface AnalyticsOptions {
  beforeSend?: (event: AnalyticsEvent) => AnalyticsEvent | null;
}

export type AnalyticsQueueItem = ["event", AnalyticsEvent] | ["page"];

declare global {
  interface Window {
    __multivrsAnalytics?: {
      page: () => void;
      track: (event: AnalyticsEvent) => void;
    };
    multivrsAnalyticsQueue?: AnalyticsQueueItem[];
  }
}
