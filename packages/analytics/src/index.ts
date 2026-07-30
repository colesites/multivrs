import type { AnalyticsOptions, AnalyticsPrimitive, AnalyticsQueueItem } from "./types";

export type { AnalyticsEvent, AnalyticsOptions, AnalyticsPrimitive } from "./types";

let options: AnalyticsOptions = {};

export function configureAnalytics(next: AnalyticsOptions): void {
  options = next;
}

export function page(): void {
  dispatch(["page"]);
}

export function track(name: string, properties?: Record<string, AnalyticsPrimitive>): void {
  const event = { name, properties };
  const candidate = options.beforeSend ? options.beforeSend(event) : event;
  if (!candidate || typeof window === "undefined") return;
  dispatch(["event", candidate]);
}

function dispatch(item: AnalyticsQueueItem): void {
  if (typeof window === "undefined") return;
  if (item[0] === "page" && window.__multivrsAnalytics) {
    window.__multivrsAnalytics.page();
    return;
  }
  if (item[0] === "event" && window.__multivrsAnalytics) {
    window.__multivrsAnalytics.track(item[1]);
    return;
  }
  window.multivrsAnalyticsQueue ??= [];
  window.multivrsAnalyticsQueue.push(item);
}
