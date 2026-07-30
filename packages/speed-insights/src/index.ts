export type WebVitalName = "CLS" | "INP" | "LCP" | "TTFB";

export interface WebVitalReport {
  name: WebVitalName;
  path?: string;
  route?: string;
  value: number;
}

export function reportWebVital(report: WebVitalReport): boolean {
  if (typeof navigator === "undefined") return false;
  const body = JSON.stringify({
    name: report.name,
    path: report.path ?? location.pathname,
    route: report.route,
    value: report.value,
  });
  return navigator.sendBeacon("/_multivrs/vitals", new Blob([body], { type: "application/json" }));
}
