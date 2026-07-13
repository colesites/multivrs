import {
  Activity,
  AtSign,
  Gauge,
  Globe,
  LayoutGrid,
  type LucideIcon,
  Network,
  Radar,
  Rocket,
  ScrollText,
  Settings,
  ShieldCheck,
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
  { name: "Projects", slug: "", icon: LayoutGrid },
  { name: "Deployments", slug: "deployments", icon: Rocket },
  { name: "Logs", slug: "logs", icon: ScrollText },
  { name: "Analytics", slug: "analytics", icon: Activity },
  { name: "Speed Insights", slug: "speed-insights", icon: Gauge },
  { name: "Observability", slug: "observability", icon: Radar },
  { name: "Firewall", slug: "firewall", icon: ShieldCheck },
  { name: "CDN", slug: "cdn", icon: Network },
  { name: "Domains", slug: "domains", icon: Globe },
  { name: "Emails", slug: "emails", icon: AtSign, badge: "Beta" },
  { name: "Settings", slug: "settings", icon: Settings },
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
  return `/${username}/${scope}/${slug}`;
}

import { Binary, CreditCard, Shield, Users } from "lucide-react";

export const SETTINGS_NAV_GROUPS = [
  {
    title: "",
    items: [{ name: "General", href: "/dashboard/settings", icon: Settings }],
  },
  {
    title: "Workspace",
    items: [
      { name: "Members", href: "/dashboard/settings/members", icon: Users },
      {
        name: "Billing",
        href: "/dashboard/settings/billing",
        icon: CreditCard,
      },
      { name: "Security", href: "/dashboard/settings/security", icon: Shield },
    ],
  },
  {
    title: "Advanced",
    items: [
      {
        name: "Developer Settings",
        href: "/dashboard/settings/developer",
        icon: Binary,
      },
    ],
  },
];
