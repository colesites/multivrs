/** Deployment health for a project's latest production deploy. */
export type ProjectStatus = "idle" | "ready" | "building" | "error";

export interface DashboardProject {
  id: string;
  slug: string;
  name: string;
  /** Public site URL, using a custom domain when one is connected. */
  siteUrl: string | null;
  /** Human-readable hostname shown below the project name. */
  siteLabel: string | null;
  /** Site favicon candidate. The card falls back to the Multivrs mark. */
  faviconUrl: string | null;
  /** Persisted GitHub repository URL and its `owner/name` label. */
  repositoryUrl: string | null;
  repositoryLabel: string | null;
  status: ProjectStatus;
  latestDeployment: {
    id: string;
    label: string;
    branch: string;
    createdAt: string;
  } | null;
  /** Analytics data for the card. */
  analytics?: {
    pageVisits: string;
    speedInsightScore: number;
  };
}
