import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import {
  ACCENT_STYLES,
  STATUS_STYLES,
  type AccentColor,
  type StatusVariant,
} from "@/features/dashboard";

interface ResourceCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  accentColor?: AccentColor;
  status?: { label: string; variant: StatusVariant };
  meta?: { label: string; value: string | React.ReactNode }[];
  badge?: string;
  footerLeft?: React.ReactNode;
  footerRight?: React.ReactNode;
  onClick?: () => void;
  children?: React.ReactNode;
}

export function ResourceCard({
  icon, title, subtitle, accentColor = "blue",
  status, meta, badge, footerLeft, footerRight, onClick, children,
}: ResourceCardProps) {
  const accent = ACCENT_STYLES[accentColor];

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-[24px] border border-white/6 bg-background overflow-hidden transition-all duration-500 hover:border-white/10 card-grain inner-glow",
        accent.shadow,
        onClick && "cursor-pointer"
      )}
      style={{ "--glow-color": accent.glow } as React.CSSProperties}
      onClick={onClick}
    >
      {/* Top accent line */}
      <div className={cn("h-[2px] w-full bg-linear-to-r from-transparent to-transparent star-glow", accent.topLine)} />

      {/* Ambient glow orb */}
      <div
        className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-[50px] opacity-0 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none"
        style={{ backgroundColor: accent.glow }}
      />

      {/* Main content */}
      <div className="relative z-10 p-6 flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-4 min-w-0">
            <div className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border transition-all duration-500 group-hover:scale-110",
              accent.iconBg, accent.iconBgHover
            )}>
              {icon}
            </div>
            <div className="min-w-0">
              <h3 className={cn("text-[15px] font-bold text-foreground tracking-tight truncate transition-colors duration-300", accent.titleHover)}>
                {title}
              </h3>
              {subtitle && (
                <p className="text-[11px] text-muted-foreground/50 font-medium mt-0.5 truncate font-mono">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {badge && (
              <span className="text-[9px] font-bold text-foreground/60 uppercase tracking-[0.15em] bg-white/4 border border-white/6 rounded-lg px-2.5 py-1">
                {badge}
              </span>
            )}
            {status && (
              <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-bold uppercase tracking-[0.15em]", STATUS_STYLES[status.variant].pill)}>
                <div className="relative flex h-1.5 w-1.5">
                  {status.variant === "building" && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current" />
                  )}
                  <span className={cn("relative inline-flex rounded-full h-1.5 w-1.5", STATUS_STYLES[status.variant].dot)} />
                </div>
                {status.label}
              </div>
            )}
          </div>
        </div>

        {children}

        {meta && meta.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4">
            {meta.map((m, i) => (
              <div key={i} className="flex flex-col gap-0.5">
                <span className="text-[9px] font-bold text-muted-foreground/35 uppercase tracking-[0.2em]">{m.label}</span>
                <span className="text-xs font-semibold text-foreground/70">{m.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {(footerLeft || footerRight) && (
        <div className="relative z-10 border-t border-white/4 px-6 py-4 flex items-center justify-between">
          <div>{footerLeft}</div>
          <div>{footerRight || (
            <ArrowUpRight className="h-4 w-4 text-muted-foreground/20 group-hover:text-foreground/50 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          )}</div>
        </div>
      )}
    </div>
  );
}
