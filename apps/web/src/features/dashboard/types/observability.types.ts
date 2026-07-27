export interface ObservabilityData {
  activeDeployments: number;
  averageLatency: number;
  errorDeployments: number;
  errorRate: number;
  recentErrors: Array<{
    createdAt: string;
    deploymentId: string;
    message: string;
  }>;
  requests: number;
  state: "ready" | "unconfigured" | "error";
}
