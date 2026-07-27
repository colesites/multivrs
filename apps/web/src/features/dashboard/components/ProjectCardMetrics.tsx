import { Activity, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProjectCardMetrics({
  visits,
  speed,
}: {
  visits: number | string;
  speed: number;
}) {
  const speedColor =
    speed >= 90
      ? "text-emerald-500"
      : speed >= 50
        ? "text-amber-500"
        : "text-rose-500";
  return (
    <div className="flex items-center justify-between border-t border-[var(--hairline)] bg-black/20 px-5 py-3">
      <div className="flex items-center gap-5">
        <div
          className="flex items-center gap-1.5"
          title="Page Visits (Last 30d)"
        >
          <Activity className="size-3.5 text-blue-400" />
          <span className="text-[12px] font-bold text-foreground/80">
            {visits}
          </span>
        </div>
        <div className="flex items-center gap-1.5" title="Speed Insight Score">
          <Zap
            className={cn("size-3.5", speedColor)}
            fill="currentColor"
            fillOpacity={0.2}
          />
          <span className="text-[12px] font-bold text-foreground/80">
            {speed || "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
