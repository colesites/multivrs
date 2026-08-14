import { ShieldCheck } from "lucide-react";
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
    <div className="mx-auto w-full max-w-6xl space-y-7 px-5 py-8">
      <header className="flex items-start justify-between gap-6">
        <div>
          <p className="font-geist-mono text-[10px] uppercase tracking-[0.16em] text-purple-400">
            Edge security
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
            Firewall
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ordered traffic rules for {projectName}. The first match wins.
          </p>
        </div>
        <div className="flex size-10 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-400/[0.06]">
          <ShieldCheck className="size-5 text-purple-300" />
        </div>
      </header>
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
