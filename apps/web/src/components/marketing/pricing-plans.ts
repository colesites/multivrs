import {
  BadgeCheck,
  Blocks,
  ChartNoAxesCombined,
  CheckCircle2,
  ContactRound,
  Cpu,
  Earth,
  Gauge,
  GitBranch,
  Headset,
  type LucideIcon,
  Mail,
  RadioTower,
  Shield,
  ShieldCheck,
  ShieldCog,
  TimerReset,
  UserRoundCog,
  UsersRound,
  WalletCards,
  Workflow,
} from "lucide-react";

const FEATURE_ICON_RULES: Array<{ icon: LucideIcon; words: string[] }> = [
  { icon: GitBranch, words: ["repo", "repository", "deploy from git"] },
  {
    icon: Workflow,
    words: ["ci/cd", "continuous integration", "automatic deployment"],
  },
  {
    icon: Shield,
    words: ["web application firewall", "web firewall", "waf"],
  },
  {
    icon: RadioTower,
    words: ["cdn", "content delivery"],
  },
  { icon: Cpu, words: ["fluid compute", "compute"] },
  { icon: ShieldCheck, words: ["ddos"] },
  {
    icon: ChartNoAxesCombined,
    words: ["traffic", "performance insights"],
  },
  { icon: Mail, words: ["email domain"] },
  {
    icon: WalletCards,
    words: ["spend management", "spend control"],
  },
  {
    icon: UsersRound,
    words: ["team collaboration"],
  },
  {
    icon: Gauge,
    words: ["faster build", "no queue"],
  },
  {
    icon: TimerReset,
    words: ["cold start"],
  },
  {
    icon: Blocks,
    words: ["enterprise add-on"],
  },
];

export function iconForPricingFeature(text: string): LucideIcon {
  const normalized = text.toLowerCase();
  return (
    FEATURE_ICON_RULES.find(({ words }) =>
      words.some((word) => normalized.includes(word)),
    )?.icon ?? CheckCircle2
  );
}

export const ENTERPRISE_FEATURES = [
  { text: "Guest and team permissions", icon: UserRoundCog },
  { text: "Company directory sync", icon: ContactRound },
  { text: "Managed firewall rules", icon: ShieldCog },
  { text: "Multi-region failover", icon: Earth },
  { text: "99.99% uptime", icon: BadgeCheck },
  { text: "Priority support", icon: Headset },
];
