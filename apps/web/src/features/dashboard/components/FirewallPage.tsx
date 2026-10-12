import { DashboardPageHeader } from "@/features/dashboard/components/DashboardPageHeader";
import { FirewallRuleComposer } from "@/features/dashboard/components/FirewallRuleComposer";
import { FirewallRuleRows } from "@/features/dashboard/components/FirewallRuleRows";
import type { DashboardFirewallRule } from "@/features/dashboard/types/firewall-rule.types";

export function FirewallPage({
  projectId,
  projectName,
  rules,
}: {
  projectId: string;
  projectName: string;
  rules: DashboardFirewallRule[];
}) {
  return (
    <div className="w-full space-y-6 px-5 py-6">
      <DashboardPageHeader
        title="Firewall"
        description={
          <>Ordered traffic rules for {projectName}. The first match wins.</>
        }
      />
      <section className="overflow-hidden rounded-2xl border border-[var(--hairline)] bg-background/70 shadow-2xl shadow-black/10">
        <div className="px-4 py-4">
          <h2 className="text-sm font-semibold">Custom rules</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Create, pause, and remove rules without redeploying.
          </p>
        </div>
        <FirewallRuleComposer projectId={projectId} />
        <FirewallRuleRows projectId={projectId} rules={rules} />
      </section>
    </div>
  );
}
