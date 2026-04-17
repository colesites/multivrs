/** Static data for the dashboard overview page */
import type { ActivityItem } from "@/features/dashboard";

export const SPARKLINE_DATA = {
  projects: [
    { v: 300 }, { v: 450 }, { v: 380 }, { v: 500 }, { v: 420 }, { v: 600 }, { v: 560 }, { v: 680 },
  ],
  domains: [
    { v: 500 }, { v: 420 }, { v: 550 }, { v: 480 }, { v: 650 }, { v: 590 }, { v: 640 }, { v: 710 },
  ],
  email: [
    { v: 200 }, { v: 350 }, { v: 250 }, { v: 400 }, { v: 350 }, { v: 450 }, { v: 520 }, { v: 480 },
  ],
  analytics: [
    { v: 400 }, { v: 300 }, { v: 500 }, { v: 450 }, { v: 550 }, { v: 600 }, { v: 520 }, { v: 700 },
  ],
} as const;

export const RECENT_ACTIVITY: ActivityItem[] = [
  { action: "Deployed", target: "kontinue-ai", time: "2m ago", status: "success" },
  { action: "SSL renewed", target: "echolive.io", time: "18m ago", status: "success" },
  { action: "Build failed", target: "nexus-staging", time: "1h ago", status: "error" },
  { action: "Domain added", target: "studio.multivrs.space", time: "3h ago", status: "success" },
  { action: "Scaled up", target: "kontinue-prod-node", time: "5h ago", status: "warning" },
];

export const MOCK_NOTIFICATIONS = [
  { id: "1", title: "Deployment successful", description: "multivrs-space-v2 has been deployed to production.", time: "2 min ago", type: "success" as const, read: false },
  { id: "2", title: "Domain SSL expiring", description: "The SSL certificate for echolive.io expires in 3 days.", time: "1 hour ago", type: "warning" as const, read: false },
  { id: "3", title: "New team member", description: "Alice accepted your invitation to 'Multivrs Dev'.", time: "2 hours ago", type: "info" as const, read: false },
  { id: "4", title: "Build failed in CI", description: "Deploy to staging failed due to type errors.", time: "5 hours ago", type: "error" as const, read: true },
  { id: "5", title: "Billing method updated", description: "Your default payment method was updated.", time: "1 day ago", type: "info" as const, read: true },
];
