import type {
  LabelValuePair,
  PricingPlan,
  SectionCard,
} from "@/components/sections/home.types";

export const SOCIAL_PROOF: string[] = [
  "Nexus Labs",
  "Astroline",
  "Horizon Ventures",
  "Pulse Studio",
  "Northstar Systems",
];

export const WHY_MULTIVRS: SectionCard[] = [
  {
    title: "Unified platform",
    description: "Deploy, observe, optimize, and scale from one system.",
  },
  {
    title: "Engineering velocity",
    description: "Preview-first workflows reduce review and release friction.",
  },
  {
    title: "Production confidence",
    description: "Rollback rails, logs, and performance baselines built in.",
  },
];

export const FEATURE_SYSTEM: SectionCard[] = [
  { title: "Launchpad", description: "Instant deploy and branch previews." },
  { title: "Warp Mesh", description: "Global edge delivery and caching." },
  { title: "Flashpoint", description: "Core Web Vitals and latency insights." },
  { title: "Signal", description: "Traffic, usage, and reliability analytics." },
  { title: "Vault", description: "Object storage for artifacts and media." },
  { title: "Secret Core", description: "Secure environment and token control." },
];

export const DEV_EXPERIENCE: SectionCard[] = [
  { title: "Space CLI", description: "Ship from terminal with typed commands." },
  { title: "Mission API", description: "Automate deployment workflows safely." },
  { title: "Starter Nebula", description: "Launch with optimized project templates." },
];

export const PERFORMANCE_METRICS: LabelValuePair[] = [
  { label: "Global request success", value: "99.99%" },
  { label: "Median deployment time", value: "43s" },
  { label: "Preview generation", value: "<12s" },
  { label: "Edge cache hit ratio", value: "94%" },
];

export const TESTIMONIALS: SectionCard[] = [
  {
    title: "Nexus Labs",
    description: "Multivrs cut our release cycle in half while improving reliability.",
  },
  {
    title: "EchoLive Media",
    description: "The deployment and observability workflow feels enterprise-ready.",
  },
];

export const PRICING_PREVIEW: PricingPlan[] = [
  { title: "Free", description: "For solo builders", price: "$0", cta: "Start free" },
  { title: "Pro", description: "For product teams", price: "$29", cta: "Upgrade to Pro" },
  {
    title: "Business",
    description: "For scaling organizations",
    price: "Custom",
    cta: "Talk to sales",
  },
];

export const FAQ_ITEMS: SectionCard[] = [
  {
    title: "Is Multivrs Space only for Next.js?",
    description: "No. Space supports major JS frameworks and static workflows.",
  },
  {
    title: "Can we migrate from Vercel?",
    description: "Yes. We provide guided migration and domain cutover workflows.",
  },
  {
    title: "Does Multivrs support teams?",
    description: "Yes. Team Constellation includes role-based collaboration.",
  },
];
