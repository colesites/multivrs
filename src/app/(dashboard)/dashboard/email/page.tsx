"use client";

import { Mail, Plus, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { mockEmails } from "@/lib/mock";
import { cn } from "@/lib/utils";
import { ResourceCard } from "@/features/dashboard";

export default function EmailPage() {
  return (
    <div className="space-y-8 relative z-10 animate-in fade-in slide-in-from-bottom-[5%] duration-700 ease-out fill-mode-both max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mt-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground tracking-tight">Email Routing</h2>
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">Configure automated email forwarding for your domains via the edge network.</p>
        </div>
        <button className="inline-flex items-center gap-2.5 rounded-2xl bg-foreground px-6 py-3.5 text-sm font-bold text-background hover:bg-foreground/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-[0.98]">
          <Plus className="h-4 w-4 stroke-[3px]" />
          New Route
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {mockEmails.map((ml) => (
          <ResourceCard
            key={ml.id}
            icon={<Mail className="h-5 w-5 text-purple-400" />}
            title={ml.address}
            accentColor="purple"
            status={{
              label: ml.status,
              variant: ml.status === "Active" ? "success" : "warning",
            }}
            meta={[
              { label: "Emails Handled", value: ml.caught.toLocaleString() },
            ]}
            footerLeft={
              <div className="flex items-center gap-2 text-xs text-muted-foreground/50 min-w-0">
                <ArrowRight className="h-3 w-3 text-purple-500/50 shrink-0" />
                <span className="truncate max-w-[200px] font-medium text-purple-400/70">{ml.forwardTo}</span>
              </div>
            }
          >
            {/* Forward-to block inside the card body */}
            <div className="pl-4 border-l-2 border-white/[0.04] mt-1">
              <span className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-[0.2em] block mb-1">Edge Forwards To</span>
              <span className="text-sm font-semibold text-purple-400/80 truncate block">{ml.forwardTo}</span>
            </div>
          </ResourceCard>
        ))}
      </div>
    </div>
  );
}
