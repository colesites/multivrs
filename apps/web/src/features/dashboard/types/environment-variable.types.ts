export type EnvironmentTarget = "development" | "preview" | "production";

export interface DashboardEnvironmentVariable {
  id: string;
  key: string;
  targets: EnvironmentTarget[];
  updatedAt: string;
  value: string;
}
