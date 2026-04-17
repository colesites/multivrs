/** Shared types for dashboard feature components */

export interface StarCardProps {
  title: string;
  metric: string;
  unit: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  glowColor: string;
  accentColor: string;
  sparklineData: readonly { v: number }[];
  trend: string;
  trendUp: boolean;
  delay: number;
}

export interface MicroStatProps {
  label: string;
  value: string;
  badge: string;
  color: "emerald" | "amber" | "blue" | "purple";
  subValue?: string;
}

export interface QuickActionProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
}

export interface PerfCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
  color: "emerald" | "blue" | "purple" | "amber";
}

export interface ActivityItem {
  action: string;
  target: string;
  time: string;
  status: "success" | "error" | "warning";
}
