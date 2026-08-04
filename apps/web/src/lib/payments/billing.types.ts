export const PLAN_KEYS = ["hobby", "pro", "enterprise"] as const;
export type PlanKey = (typeof PLAN_KEYS)[number];

export const ADD_ON_KEYS = [
  "developer_seat",
  "speed_insights",
  "web_analytics_plus",
  "observability_plus",
  "mail_volume",
] as const;
export type AddOnKey = (typeof ADD_ON_KEYS)[number];

const RESOURCE_KEYS = [
  "projects",
  "developer_seats",
  "mailboxes",
  "mail_aliases",
  "mail_domains",
  "mailbox_members",
  "firewall_rules",
  "ip_blocks",
  "bypass_rules",
  "environment_variables",
  "log_drains",
  "concurrent_sandboxes",
  "bulk_redirects",
  "edge_config_entries",
  "microfrontend_routes",
  "workflows",
  "cron_jobs",
] as const;
export type ResourceKey = (typeof RESOURCE_KEYS)[number];

export type AddOnState = Partial<Record<AddOnKey, number>>;

export type MetricDefinition = {
  eventName: string;
  hobbyAllowance: bigint;
  proAllowance: bigint;
  unitPriceCents: number;
  unitSize: bigint;
  projectScoped?: boolean;
};

export type EntitlementContext = {
  addOns: AddOnState;
  entitlementOverrides: Record<string, number | null>;
  isLimitExempt: boolean;
  overageRateOverrides: Record<string, number>;
  overagesEnabled: boolean;
  plan: PlanKey;
  spendLimitCents: number | null;
};

export type UsageDecision = {
  allowed: boolean;
  estimatedCostDeltaCents: number;
  overageDelta: bigint;
  reason: string | null;
};
