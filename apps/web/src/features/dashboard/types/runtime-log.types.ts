export type RuntimeLogLevel = "info" | "warn" | "error";

export interface RuntimeLogItem {
  id: string;
  deploymentId: string;
  level: RuntimeLogLevel;
  message: string;
  source: string;
  timestamp: string;
}
