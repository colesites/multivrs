export interface DashboardEmailRoute {
  destination: string;
  enabled: boolean;
  id: string;
  projectId: string | null;
  source: string;
  updatedAt: string;
}

export interface EmailDomainOption {
  hostname: string;
  projectId: string | null;
}
