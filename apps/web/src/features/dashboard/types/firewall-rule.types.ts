import type { FirewallAction, FirewallCondition } from "@multivrs/firewall";

export interface DashboardFirewallRule {
  id: string;
  name: string;
  action: FirewallAction;
  conditions: FirewallCondition[];
  enabled: boolean;
  priority: number;
  updatedAt: string;
}
