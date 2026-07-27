/** Static data for the dashboard overview page */
import type { ActivityItem } from "@/features/dashboard";

export const SPARKLINE_DATA = {
  projects: [
    { v: 300 },
    { v: 450 },
    { v: 380 },
    { v: 500 },
    { v: 420 },
    { v: 600 },
    { v: 560 },
    { v: 680 },
  ],
  domains: [
    { v: 500 },
    { v: 420 },
    { v: 550 },
    { v: 480 },
    { v: 650 },
    { v: 590 },
    { v: 640 },
    { v: 710 },
  ],
  email: [
    { v: 200 },
    { v: 350 },
    { v: 250 },
    { v: 400 },
    { v: 350 },
    { v: 450 },
    { v: 520 },
    { v: 480 },
  ],
  analytics: [
    { v: 400 },
    { v: 300 },
    { v: 500 },
    { v: 450 },
    { v: 550 },
    { v: 600 },
    { v: 520 },
    { v: 700 },
  ],
} as const;

const DEVELOPMENT_ACTIVITY: ActivityItem[] = [
  {
    action: "Deployed",
    target: "kontinue-ai",
    time: "2m ago",
    status: "success",
  },
  {
    action: "SSL renewed",
    target: "echolive.io",
    time: "18m ago",
    status: "success",
  },
  {
    action: "Build failed",
    target: "nexus-staging",
    time: "1h ago",
    status: "error",
  },
  {
    action: "Domain added",
    target: "studio.multivrs.space",
    time: "3h ago",
    status: "success",
  },
  {
    action: "Scaled up",
    target: "kontinue-prod-node",
    time: "5h ago",
    status: "warning",
  },
];

export const RECENT_ACTIVITY =
  process.env.NODE_ENV === "development" ? DEVELOPMENT_ACTIVITY : [];
