/** Deployment health for a project's latest production deploy. */
export type ProjectStatus = "ready" | "building" | "error";

export interface DashboardProject {
  slug: string;
  name: string;
  /** Production domain, shown under the name. */
  domain: string;
  /** GitHub repo in `owner/name` form. */
  repo: string;
  status: ProjectStatus;
  /** Latest commit subject. */
  commitMessage: string;
  branch: string;
  /** Human-relative time of the latest deploy. */
  updatedAt: string;
  /** Analytics data for the card. */
  analytics?: {
    pageVisits: string;
    speedInsightScore: number;
  };
}
