export interface DashboardWorkflowStep {
  body?: string;
  durationSeconds?: number;
  headers?: Record<string, string>;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  name: string;
  retries?: number;
  timeoutSeconds?: number;
  type: "delay" | "http";
  url?: string;
}

export interface DashboardWorkflow {
  createdAt: string;
  description: string | null;
  enabled: boolean;
  id: string;
  name: string;
  runs: Array<{
    createdAt: string;
    id: string;
    status: string;
    trigger: string;
  }>;
  schedules: Array<{
    expression: string;
    id: string;
    nextRunAt: string;
  }>;
  steps: DashboardWorkflowStep[];
}
