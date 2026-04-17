import type {
  EcosystemProduct,
  EcosystemStat,
} from "@/components/sections/ecosystem.types";

export const ECOSYSTEM_STATS: EcosystemStat[] = [
  { label: "Deployments launched", value: "120k+" },
  { label: "Edge regions", value: "42" },
  { label: "Median cold start", value: "<180ms" },
];

export const ECOSYSTEM_PRODUCTS: EcosystemProduct[] = [
  {
    name: "Multivrs Space",
    category: "Cloud Platform",
    description:
      "Branch previews, global delivery, and production rollbacks in one control plane.",
  },
  {
    name: "Nexus",
    category: "Developer Tools",
    description:
      "A framework layer for building and scaling product workflows across teams.",
  },
  {
    name: "Planet UI",
    category: "Open Source UI",
    description:
      "Production-grade component primitives engineered for speed and consistency.",
  },
  {
    name: "Kontinue AI",
    category: "Applied AI",
    description:
      "Embedded assistants that improve operations, content, and decision-making.",
  },
];
