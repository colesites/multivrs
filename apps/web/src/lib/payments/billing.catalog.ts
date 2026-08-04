import type { AddOnKey, PlanKey, ResourceKey } from "./billing.types";

export { METER_CATALOG } from "@/lib/payments/billing-meter-catalog";

export const RESOURCE_LIMITS: Record<
  ResourceKey,
  Record<PlanKey, number | null>
> = {
  bypass_rules: { enterprise: null, hobby: 0, pro: 10 },
  bulk_redirects: { enterprise: null, hobby: 100, pro: 1_000 },
  concurrent_sandboxes: { enterprise: null, hobby: 1, pro: 2 },
  cron_jobs: { enterprise: null, hobby: 2, pro: 10 },
  developer_seats: { enterprise: null, hobby: 1, pro: 1 },
  edge_config_entries: { enterprise: null, hobby: 100, pro: 1_000 },
  environment_variables: { enterprise: null, hobby: 50, pro: 500 },
  firewall_rules: { enterprise: null, hobby: 3, pro: 20 },
  ip_blocks: { enterprise: null, hobby: 3, pro: 50 },
  log_drains: { enterprise: null, hobby: 0, pro: 1 },
  mail_aliases: { enterprise: null, hobby: 3, pro: 25 },
  mail_domains: { enterprise: null, hobby: 1, pro: 3 },
  mailbox_members: { enterprise: null, hobby: 0, pro: 5 },
  mailboxes: { enterprise: null, hobby: 1, pro: 5 },
  microfrontend_routes: { enterprise: null, hobby: 2, pro: 10 },
  projects: { enterprise: null, hobby: 3, pro: 20 },
  workflows: { enterprise: null, hobby: 3, pro: 20 },
};

export const ADD_ON_CATALOG: Record<
  AddOnKey,
  { lookupKey: string; projectScoped: boolean }
> = {
  developer_seat: {
    lookupKey: "multivrs_developer_seat_monthly",
    projectScoped: false,
  },
  mail_volume: {
    lookupKey: "multivrs_mail_volume_monthly",
    projectScoped: false,
  },
  observability_plus: {
    lookupKey: "multivrs_observability_plus_monthly",
    projectScoped: false,
  },
  speed_insights: {
    lookupKey: "multivrs_speed_insights_monthly",
    projectScoped: true,
  },
  web_analytics_plus: {
    lookupKey: "multivrs_web_analytics_plus_monthly",
    projectScoped: false,
  },
};
