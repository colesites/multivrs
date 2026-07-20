export interface DashboardDeploymentLog {
  id: string;
  level: string;
  message: string;
  createdAt: string;
}

export interface DashboardDeploymentDetail {
  id: string;
  project: string;
  status: string;
  url: string | null;
  branch: string;
  commitSha: string | null;
  errorMessage: string | null;
  createdAt: string;
  logs: DashboardDeploymentLog[];
}
