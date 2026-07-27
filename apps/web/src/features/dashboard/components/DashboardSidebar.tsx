import { Activity, Bell, Cpu, Database, Globe, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardSidebar() {
  return (
    <div className="flex flex-col gap-6 pt-4">
      {/* Usage Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[13px] font-semibold text-foreground">Usage</h3>
        </div>

        <div className="rounded-[16px] border border-[var(--hairline)] bg-[var(--ink-raised)]/40 p-4 card-grain">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[12px] font-medium text-muted-foreground">
              Last 30 days
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-6 text-[10px] px-2 font-bold rounded-md bg-white text-black hover:bg-white/90"
            >
              Upgrade
            </Button>
          </div>

          <div className="space-y-3.5">
            <UsageStat
              icon={<Cpu className="h-3.5 w-3.5 text-amber-500" />}
              label="Fluid Active CPU"
              value="3h 27m / 4h"
            />
            <UsageStat
              icon={<Globe className="h-3.5 w-3.5 text-blue-500" />}
              label="Edge Requests"
              value="291K / 1M"
            />
            <UsageStat
              icon={<Zap className="h-3.5 w-3.5 text-emerald-500" />}
              label="Fast Origin Transfer"
              value="2.75 GB / 10 GB"
            />
            <UsageStat
              icon={<Database className="h-3.5 w-3.5 text-purple-500" />}
              label="Image Optimization"
              value="16K / 100K"
            />
          </div>

          <div className="mt-4 flex justify-center border-t border-[var(--hairline)] pt-3">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[11px] text-muted-foreground/80 hover:text-foreground"
            >
              <Activity className="h-3 w-3 mr-1.5" /> View All
            </Button>
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[13px] font-semibold text-foreground">Alerts</h3>
        </div>

        <div className="rounded-[16px] border border-[var(--hairline)] bg-[var(--ink-raised)]/40 p-6 flex flex-col items-center text-center card-grain">
          <div className="mb-3 h-10 w-10 rounded-full bg-white/[0.03] border border-[var(--hairline)] flex items-center justify-center">
            <Bell className="h-4 w-4 text-muted-foreground" />
          </div>
          <h4 className="text-[13px] font-semibold text-foreground mb-1">
            Get alerted for anomalies
          </h4>
          <p className="text-[12px] text-muted-foreground mb-4 leading-relaxed max-w-[200px]">
            Automatically monitor your projects for anomalies and get notified.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-[11px] rounded-lg bg-white/[0.02] border-[var(--hairline)] hover:bg-white/[0.05]"
          >
            Upgrade to Pro
          </Button>
        </div>
      </div>

      {/* Recent Previews Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[13px] font-semibold text-foreground">
            Recent Previews
          </h3>
        </div>

        <div className="rounded-[16px] border border-dashed border-[var(--hairline)] bg-[var(--ink-raised)]/20 p-6 flex flex-col items-center text-center">
          <div className="mb-3 h-10 w-10 rounded-full bg-white/[0.02] border border-[var(--hairline)] flex items-center justify-center">
            <Globe className="h-4 w-4 text-muted-foreground/50" />
          </div>
          <p className="text-[12px] text-muted-foreground/70 leading-relaxed max-w-[180px]">
            Preview deployments that you have recently visited will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}

function UsageStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center h-4 w-4 rounded-full bg-white/[0.03] border border-white/5">
          {icon}
        </div>
        <span className="text-[11.5px] text-foreground/80 font-medium tracking-tight">
          {label}
        </span>
      </div>
      <span className="text-[11px] font-mono text-muted-foreground/70">
        {value}
      </span>
    </div>
  );
}
