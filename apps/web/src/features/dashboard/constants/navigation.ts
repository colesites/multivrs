import {
  Activity,
  AtSign,
  Gauge,
  Globe,
  KeyRound,
  LayoutGrid,
  type LucideIcon,
  Network,
  PlugZap,
  Radar,
  Rocket,
  ScrollText,
  Settings,
  ShieldCheck,
  SquareTerminal,
  Workflow,
} from "lucide-react";

/**
 * The scope segment that means "all projects" in the account view — mirrors
 * Vercel's `~`. URLs read `/[username]/~/cdn`. A specific project swaps `~`
 * for the project slug: `/[username]/kontinue-ai/cdn`.
 */
export const ALL_PROJECTS_SCOPE = "~";

export interface DashboardNavItem {
  /** Display label. */
  name: string;
  /** Trailing URL segment, e.g. `cdn`. Empty string = the scope root. */
  slug: string;
  icon: LucideIcon;
  /** Optional pill, e.g. "Beta". */
  badge?: string;
}

/**
 * Account-level navigation. `Projects` is the scope root (`/[username]` for the
 * `~` scope, `/[username]/[project]` for a project); everything else hangs off
 * the scope segment.
 */
export const DASHBOARD_NAV_ITEMS: readonly DashboardNavItem[] = [
  { name: "Projects", slug: "", icon: LayoutGrid, badge: "Beta" },
  { name: "Deployments", slug: "deployments", icon: Rocket, badge: "Beta" },
  { name: "Logs", slug: "logs", icon: ScrollText, badge: "Beta" },
  { name: "Analytics", slug: "analytics", icon: Activity, badge: "Soon" },
  {
    name: "Speed Insights",
    slug: "speed-insights",
    icon: Gauge,
    badge: "Soon",
  },
  { name: "Observability", slug: "observability", icon: Radar, badge: "Soon" },
  { name: "Firewall", slug: "firewall", icon: ShieldCheck, badge: "Soon" },
  { name: "CDN", slug: "cdn", icon: Network, badge: "Soon" },
  {
    name: "Environment Variables",
    slug: "environment-variables",
    icon: KeyRound,
    badge: "Soon",
  },
  { name: "Integrations", slug: "integrations", icon: PlugZap, badge: "Soon" },
  { name: "Sandboxes", slug: "sandboxes", icon: SquareTerminal, badge: "Soon" },
  { name: "Workflows", slug: "workflows", icon: Workflow, badge: "Soon" },
  { name: "Domains", slug: "domains", icon: Globe },
  { name: "Emails", slug: "emails", icon: AtSign },
  { name: "Settings", slug: "settings", icon: Settings, badge: "Beta" },
] as const;

/**
 * Build the href for a nav item within a given account + scope.
 * @param username account slug (no leading slash)
 * @param scope   `~` for all projects, or a project slug
 */
export function buildNavHref(
  username: string,
  scope: string,
  slug: string,
): string {
  if (slug === "") {
    // Projects/overview: account root for `~`, project root otherwise.
    return scope === ALL_PROJECTS_SCOPE
      ? `/${username}`
      : `/${username}/${scope}`;
  }
  const href = `/${username}/${scope}/${slug}`;
  if (slug === "emails" || slug === "observability") {
    return `${href}?view=overview`;
  }
  return href;
}
