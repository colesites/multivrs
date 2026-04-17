/** Style maps for the ResourceCard component */

export const ACCENT_STYLES = {
  blue: {
    iconBg: "bg-blue-500/10 border-blue-500/15",
    iconBgHover: "group-hover:bg-blue-500/20",
    topLine: "via-blue-500/30",
    shadow: "hover:shadow-[0_12px_40px_-12px_rgba(59,130,246,0.15)]",
    glow: "rgba(59, 130, 246, 0.12)",
    titleHover: "group-hover:text-blue-400",
  },
  purple: {
    iconBg: "bg-purple-500/10 border-purple-500/15",
    iconBgHover: "group-hover:bg-purple-500/20",
    topLine: "via-purple-500/30",
    shadow: "hover:shadow-[0_12px_40px_-12px_rgba(168,85,247,0.15)]",
    glow: "rgba(168, 85, 247, 0.12)",
    titleHover: "group-hover:text-purple-400",
  },
  emerald: {
    iconBg: "bg-emerald-500/10 border-emerald-500/15",
    iconBgHover: "group-hover:bg-emerald-500/20",
    topLine: "via-emerald-500/30",
    shadow: "hover:shadow-[0_12px_40px_-12px_rgba(16,185,129,0.15)]",
    glow: "rgba(16, 185, 129, 0.12)",
    titleHover: "group-hover:text-emerald-400",
  },
  amber: {
    iconBg: "bg-amber-500/10 border-amber-500/15",
    iconBgHover: "group-hover:bg-amber-500/20",
    topLine: "via-amber-500/30",
    shadow: "hover:shadow-[0_12px_40px_-12px_rgba(245,158,11,0.15)]",
    glow: "rgba(245, 158, 11, 0.12)",
    titleHover: "group-hover:text-amber-400",
  },
  rose: {
    iconBg: "bg-rose-500/10 border-rose-500/15",
    iconBgHover: "group-hover:bg-rose-500/20",
    topLine: "via-rose-500/30",
    shadow: "hover:shadow-[0_12px_40px_-12px_rgba(244,63,94,0.15)]",
    glow: "rgba(244, 63, 94, 0.12)",
    titleHover: "group-hover:text-rose-400",
  },
} as const;

export const STATUS_STYLES = {
  success: {
    dot: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]",
    pill: "text-emerald-400 bg-emerald-500/8 border-emerald-500/15",
  },
  warning: {
    dot: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]",
    pill: "text-amber-400 bg-amber-500/8 border-amber-500/15",
  },
  error: {
    dot: "bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.6)]",
    pill: "text-rose-400 bg-rose-500/8 border-rose-500/15",
  },
  building: {
    dot: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]",
    pill: "text-amber-400 bg-amber-500/8 border-amber-500/15",
  },
} as const;

export type AccentColor = keyof typeof ACCENT_STYLES;
export type StatusVariant = keyof typeof STATUS_STYLES;
