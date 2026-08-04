import {
  dollars,
  RECOMMENDED_METER_RATES,
  RECOMMENDED_PLAN_ECONOMICS,
} from "../../lib/payments/pricing-economics";
import type {
  PricingComparison,
  PricingFeature,
  PricingFeatureGroup,
  PricingImplementationStatus,
  PricingPlanKey,
  PricingPlanValue,
  PricingSection,
  PricingSectionItem,
  PricingValueKind,
} from "../lib/pricing-comparison.types";

type CellSpec = {
  kind: PricingValueKind;
  note?: string;
  value?: string;
};

const INCLUDED: CellSpec = { kind: "included" };
const EXCLUDED: CellSpec = { kind: "excluded" };
const ROADMAP: CellSpec = EXCLUDED;
const PREVIEW: CellSpec = INCLUDED;
const CUSTOM: CellSpec = { kind: "custom", value: "Custom" };

function text(value: string, note?: string): CellSpec {
  return { kind: "text", note, value };
}

function values(
  hobby: CellSpec,
  pro: CellSpec,
  enterprise: CellSpec,
): PricingPlanValue[] {
  const entries: Array<[PricingPlanKey, CellSpec]> = [
    ["hobby", hobby],
    ["pro", pro],
    ["enterprise", enterprise],
  ];
  return entries.map(([planKey, value]) => ({
    _key: planKey,
    _type: "pricingPlanValue",
    planKey,
    ...value,
  }));
}

function all(value: CellSpec): PricingPlanValue[] {
  return values(value, value, value);
}

function feature(
  key: string,
  name: string,
  implementationStatus: PricingImplementationStatus,
  planValues: PricingPlanValue[],
  description?: string,
): PricingFeature {
  return {
    _key: key,
    _type: "pricingFeature",
    description,
    implementationStatus,
    name,
    values: planValues,
  };
}

function group(
  key: string,
  title: string,
  features: PricingFeature[],
  description?: string,
): PricingFeatureGroup {
  return {
    _key: key,
    _type: "pricingFeatureGroup",
    description,
    features,
    title,
  };
}

function section(
  key: string,
  title: string,
  description: string,
  items: PricingSectionItem[],
): PricingSection {
  return {
    _key: key,
    _type: "pricingSection",
    description,
    items,
    slug: { current: key },
    title,
  };
}

const rate = RECOMMENDED_METER_RATES;

const comparison = {
  title: "Compare every Multivrs plan",
  description:
    "Plan entitlements and monthly usage limits for the complete Multivrs platform, including two-way email.",
  searchPlaceholder: "Search features…",
  plans: [
    {
      _key: "hobby",
      _type: "pricingPlan" as const,
      key: "hobby" as const,
      name: "Hobby",
      description: "For personal and early-stage projects",
    },
    {
      _key: "pro",
      _type: "pricingPlan" as const,
      key: "pro" as const,
      name: "Pro",
      description: `For production teams — $${RECOMMENDED_PLAN_ECONOMICS.pro.monthlyPriceUsd} per month`,
    },
    {
      _key: "enterprise",
      _type: "pricingPlan" as const,
      key: "enterprise" as const,
      name: "Enterprise",
      description: "Contracted limits and support",
    },
  ],
  sections: [
    section(
      "delivery-network",
      "Multivrs Delivery Network",
      "Fast, secure application delivery on Multivrs and Cloudflare infrastructure.",
      [
        group("multivrs-network", "Multivrs Network", [
          feature(
            "global-pops",
            "Global Points of Presence",
            "available",
            all(INCLUDED),
            "Requests enter Cloudflare's global edge before Multivrs routing runs.",
          ),
          feature(
            "multivrs-regions",
            "Multivrs Regions",
            "preview",
            all(PREVIEW),
            "Global edge placement is live; explicit compute-region selection follows the configured runtime.",
          ),
          feature(
            "automatic-routing",
            "Automatic Routing",
            "available",
            all(INCLUDED),
            "Routes hostnames and paths to immutable deployment manifests automatically.",
          ),
          feature(
            "https-certificates",
            "HTTPS Certificates",
            "available",
            values(
              text("1 domain included"),
              text(
                "5 domains included",
                `then ${dollars(rate.saasHostname.retailPriceUsd)} per hostname / month`,
              ),
              CUSTOM,
            ),
            "Managed certificate issuance for connected custom hostnames.",
          ),
          feature("tls", "TLS/SSL Encryption", "available", all(INCLUDED)),
          feature(
            "load-balancing",
            "Traffic Load Balancing",
            "infrastructureRequired",
            all(ROADMAP),
            "Requires Cloudflare Load Balancing provisioning and health-check orchestration.",
          ),
          feature(
            "private-inter-region",
            "Private Inter-Region Network",
            "infrastructureRequired",
            all(ROADMAP),
            "Dedicated private regional networking is not currently provisioned.",
          ),
          feature(
            "region-failover",
            "Automatic Region Failover",
            "preview",
            values(EXCLUDED, PREVIEW, PREVIEW),
            "Edge failover is global; compute failover follows the configured runtime policy.",
          ),
        ]),
        group("configurable-routing", "Configurable Routing", [
          feature("reverse-proxy", "Reverse Proxy", "available", all(INCLUDED)),
          feature("rewrites", "Rewrites", "available", all(INCLUDED)),
          feature("redirects", "Redirects", "available", all(INCLUDED)),
          feature(
            "middleware",
            "Middleware Support",
            "available",
            all(INCLUDED),
          ),
        ]),
        feature(
          "edge-requests",
          "Edge Requests",
          "available",
          values(
            text("100K / month included", "hard limit"),
            text(
              "1M / month included",
              `then ${dollars(rate.edgeRequests.retailPriceUsd)} per 1M`,
            ),
            CUSTOM,
          ),
          "Dynamic requests handled by the Multivrs serving edge. Static asset requests may be served without invoking compute.",
        ),
        feature(
          "fast-data-transfer",
          "Fast Data Transfer",
          "available",
          values(
            text("5 GB / month included", "hard limit"),
            text(
              "50 GB / month included",
              `then ${dollars(rate.containerEgress.retailPriceUsd)} per GB`,
            ),
            CUSTOM,
          ),
          "Data delivered from Multivrs storage or compute to visitors.",
        ),
      ],
    ),
    section(
      "firewall",
      "Multivrs Firewall",
      "Application-aware traffic controls and attack mitigation at the edge.",
      [
        group("web-application-firewall", "Web Application Firewall", [
          feature(
            "custom-firewall-rules",
            "Custom Firewall Rules",
            "available",
            values(text("Up to 3"), text("Up to 20"), CUSTOM),
          ),
          feature(
            "ip-blocking",
            "IP Blocking",
            "available",
            values(text("Up to 3"), text("Up to 50"), CUSTOM),
          ),
          feature(
            "system-bypass-rules",
            "System Bypass Rules",
            "available",
            values(EXCLUDED, text("Up to 10"), CUSTOM),
            "Audited and expiring tokens for scoped system bypasses.",
          ),
          feature(
            "rate-limiting",
            "Rate Limiting",
            "preview",
            values(
              text("100K checks included", "Preview"),
              text("1M checks included", "Preview"),
              CUSTOM,
            ),
            "Uses a Cloudflare Rate Limiting binding with project rules. Counters are intentionally eventually consistent.",
          ),
          feature(
            "owasp",
            "OWASP Core Ruleset (managed)",
            "infrastructureRequired",
            all(ROADMAP),
            "Requires a qualifying Cloudflare zone plan and managed WAF provisioning.",
          ),
        ]),
        group("bot-management", "Bot Management", [
          feature(
            "ddos",
            "Automated DDoS Mitigation",
            "available",
            all(INCLUDED),
          ),
          feature(
            "ai-bots",
            "AI Bots (managed ruleset)",
            "infrastructureRequired",
            all(ROADMAP),
          ),
          feature(
            "bot-protection",
            "Bot Protection (managed ruleset)",
            "preview",
            values(text("Basic checks"), PREVIEW, PREVIEW),
          ),
          feature(
            "bot-id",
            "BotID",
            "infrastructureRequired",
            all(ROADMAP),
            "Granular bot scores require Cloudflare Bot Management entitlement.",
          ),
          feature(
            "challenge-mode",
            "Attack Challenge Mode",
            "preview",
            all(PREVIEW),
          ),
        ]),
      ],
    ),
    section(
      "content-caching-optimization",
      "Content, Caching & Optimization",
      "Store, regenerate, transform, and cache content close to users.",
      [
        group("content-delivery", "Content Delivery", [
          feature(
            "cdn-cache",
            "Zero-config CDN Cache",
            "available",
            all(INCLUDED),
          ),
          feature(
            "compression",
            "Automated Compression",
            "available",
            all(INCLUDED),
          ),
          feature(
            "background-revalidation",
            "Background Revalidation",
            "available",
            all(INCLUDED),
          ),
          feature(
            "stale-while-revalidate",
            "Stale-While-Revalidate",
            "available",
            all(INCLUDED),
          ),
        ]),
        group("isr", "Incremental Static Regeneration (ISR)", [
          feature(
            "isr-reads",
            "ISR Reads",
            "available",
            values(
              text("100K / month included", "hard limit"),
              text(
                "1M / month included",
                `then ${dollars(rate.r2ClassB.retailPriceUsd)} per 1M`,
              ),
              CUSTOM,
            ),
          ),
          feature(
            "isr-writes",
            "ISR Writes",
            "available",
            values(
              text("10K / month included", "hard limit"),
              text(
                "100K / month included",
                `then ${dollars(rate.r2ClassA.retailPriceUsd)} per 1M`,
              ),
              CUSTOM,
            ),
          ),
        ]),
        feature(
          "bulk-redirects",
          "Bulk Redirects",
          "available",
          values(text("100 per project"), text("1K per project"), CUSTOM),
        ),
        group("blob", "Blob", [
          feature(
            "storage-size",
            "Storage Size",
            "available",
            values(
              text("1 GB included", "hard limit"),
              text(
                "5 GB included",
                `then ${dollars(rate.r2Storage.retailPriceUsd)} per GB-month`,
              ),
              CUSTOM,
            ),
          ),
          feature(
            "simple-operations",
            "Simple Operations",
            "available",
            values(
              text("100K / month included", "hard limit"),
              text(
                "1M / month included",
                `then ${dollars(rate.r2ClassB.retailPriceUsd)} per 1M`,
              ),
              CUSTOM,
            ),
          ),
          feature(
            "advanced-operations",
            "Advanced Operations",
            "available",
            values(
              text("10K / month included", "hard limit"),
              text(
                "100K / month included",
                `then ${dollars(rate.r2ClassA.retailPriceUsd)} per 1M`,
              ),
              CUSTOM,
            ),
          ),
          feature(
            "blob-transfer",
            "Blob Data Transfer",
            "available",
            values(
              text("5 GB / month included", "hard limit"),
              text(
                "50 GB / month included",
                `then ${dollars(rate.containerEgress.retailPriceUsd)} per GB`,
              ),
              CUSTOM,
            ),
          ),
        ]),
        group("image-optimization", "Image Optimization", [
          feature(
            "image-transformations",
            "Image Transformations",
            "available",
            values(
              text("100 / month included", "hard limit"),
              text(
                "1K / month included",
                `then ${dollars(rate.imageTransformations.retailPriceUsd)} per 1K`,
              ),
              CUSTOM,
            ),
          ),
          feature(
            "image-cache-reads",
            "Image Cache Reads",
            "available",
            values(
              text("100K / month included", "hard limit"),
              text(
                "1M / month included",
                `then ${dollars(rate.r2ClassB.retailPriceUsd)} per 1M`,
              ),
              CUSTOM,
            ),
          ),
          feature(
            "image-cache-writes",
            "Image Cache Writes",
            "available",
            values(
              text("10K / month included", "hard limit"),
              text(
                "100K / month included",
                `then ${dollars(rate.r2ClassA.retailPriceUsd)} per 1M`,
              ),
              CUSTOM,
            ),
          ),
        ]),
        group("edge-config", "Edge Config", [
          feature(
            "edge-config-reads",
            "Edge Config Reads",
            "available",
            values(
              text("100K / month included", "hard limit"),
              text(
                "1M / month included",
                `then ${dollars(rate.kvReads.retailPriceUsd)} per 1M`,
              ),
              CUSTOM,
            ),
          ),
          feature(
            "edge-config-writes",
            "Edge Config Writes",
            "available",
            values(
              text("1K / month included", "hard limit"),
              text(
                "10K / month included",
                `then ${dollars(rate.kvWrites.retailPriceUsd)} per 1M`,
              ),
              CUSTOM,
            ),
          ),
        ]),
        group("microfrontends", "Microfrontends Support", [
          feature(
            "microfrontends-projects",
            "Microfrontends",
            "available",
            values(
              text("1 included project"),
              text("3 included projects", "then $10 per additional project"),
              CUSTOM,
            ),
          ),
          feature(
            "microfrontend-routing",
            "Microfrontend Routing",
            "available",
            values(
              text("50K routed requests", "hard limit"),
              text(
                "500K routed requests",
                `then ${dollars(rate.edgeRequests.retailPriceUsd)} per 1M`,
              ),
              CUSTOM,
            ),
          ),
        ]),
      ],
    ),
    section(
      "compute",
      "Multivrs Compute",
      "Functions, isolated sandboxes, scheduled jobs, and durable workflows.",
      [
        group("functions", "Multivrs Functions", [
          feature(
            "function-cpu",
            "Active CPU",
            "preview",
            values(
              text("15 min included", "Preview · hard limit"),
              text(
                "2 vCPU-hours included",
                `then ${dollars(rate.containerCpu.retailPriceUsd)} per vCPU-hour`,
              ),
              CUSTOM,
            ),
          ),
          feature(
            "function-memory",
            "Provisioned Memory",
            "preview",
            values(
              text("1 GiB-hour included", "Preview · hard limit"),
              text(
                "8 GiB-hours included",
                `then ${dollars(rate.containerMemory.retailPriceUsd)} per GiB-hour`,
              ),
              CUSTOM,
            ),
          ),
          feature(
            "function-invocations",
            "Invocations",
            "available",
            values(
              text("100K / month included", "hard limit"),
              text(
                "1M / month included",
                `then ${dollars(rate.edgeRequests.retailPriceUsd)} per 1M`,
              ),
              CUSTOM,
            ),
          ),
          feature(
            "services",
            "Multivrs Services",
            "available",
            values(text("1 service"), text("Up to 5 services"), CUSTOM),
          ),
        ]),
        group("sandboxes", "Multivrs Sandbox", [
          feature(
            "sandbox-cpu",
            "Active CPU",
            "preview",
            values(
              text("15 min included", "Preview · hard limit"),
              text(
                "1 vCPU-hour included",
                `then ${dollars(rate.containerCpu.retailPriceUsd)} per vCPU-hour`,
              ),
              CUSTOM,
            ),
          ),
          feature(
            "sandbox-memory",
            "Provisioned Memory",
            "preview",
            values(
              text("1 GiB-hour included", "Preview · hard limit"),
              text(
                "4 GiB-hours included",
                `then ${dollars(rate.containerMemory.retailPriceUsd)} per GiB-hour`,
              ),
              CUSTOM,
            ),
          ),
          feature(
            "sandbox-creation",
            "Creation",
            "available",
            values(
              text("5 / month included", "hard limit"),
              text("25 / month included", "then $1 per 100"),
              CUSTOM,
            ),
          ),
          feature(
            "sandbox-network",
            "Network",
            "preview",
            values(
              text("1 GB included", "Preview · hard limit"),
              text(
                "10 GB included",
                `then ${dollars(rate.containerEgress.retailPriceUsd)} per GB`,
              ),
              CUSTOM,
            ),
          ),
          feature(
            "concurrent-sandboxes",
            "Concurrent Sandboxes",
            "available",
            values(text("1"), text("2"), CUSTOM),
          ),
          feature(
            "snapshot-storage",
            "Snapshot Storage",
            "infrastructureRequired",
            all(ROADMAP),
          ),
        ]),
        feature(
          "fast-origin-transfer",
          "Fast Origin Transfer",
          "available",
          values(
            text("5 GB / month included", "hard limit"),
            text(
              "50 GB / month included",
              `then ${dollars(rate.containerEgress.retailPriceUsd)} per GB`,
            ),
            CUSTOM,
          ),
        ),
        group("workflows", "Multivrs Workflows", [
          feature(
            "workflow-events",
            "Workflow Steps",
            "available",
            values(
              text("10K / month included", "hard limit"),
              text(
                "100K / month included",
                `then ${dollars(rate.workflowSteps.retailPriceUsd)} per 100K steps`,
              ),
              CUSTOM,
            ),
          ),
          feature(
            "workflow-written",
            "Data Written",
            "available",
            values(
              text("100 MB / month included", "hard limit"),
              text(
                "1 GB / month included",
                `then ${dollars(rate.workflowStorage.retailPriceUsd)} per GB`,
              ),
              CUSTOM,
            ),
          ),
          feature(
            "workflow-retained",
            "Data Retained",
            "available",
            values(
              text("100 MB included", "hard limit"),
              text(
                "1 GB included",
                `then ${dollars(rate.workflowStorage.retailPriceUsd)} per GB-month`,
              ),
              CUSTOM,
            ),
          ),
        ]),
        group("compute-automation", "Compute Automation", [
          feature(
            "api-operations",
            "API Operations",
            "available",
            all(INCLUDED),
          ),
          feature(
            "cron-jobs",
            "Cron Jobs",
            "available",
            values(text("Up to 2"), text("Up to 10"), CUSTOM),
          ),
        ]),
      ],
    ),
    section(
      "build-deployments",
      "Build & Deployments",
      "Git-driven builds, immutable releases, and production delivery controls.",
      [
        group("build-infrastructure", "Build Infrastructure", [
          feature(
            "automatic-cicd",
            "Automatic CI/CD",
            "available",
            all(INCLUDED),
          ),
          feature(
            "environment-variables",
            "Environment Variables",
            "available",
            values(text("Up to 50"), text("Up to 500"), CUSTOM),
          ),
          feature(
            "build-logs",
            "Build Logs",
            "available",
            values(text("1 day retention"), text("7 day retention"), CUSTOM),
          ),
          feature(
            "remote-cache",
            "Remote Cache",
            "available",
            values(
              text("1 GB included", "hard limit"),
              text(
                "5 GB included",
                `then ${dollars(rate.r2Storage.retailPriceUsd)} per GB-month`,
              ),
              CUSTOM,
            ),
          ),
          feature("monorepo", "Monorepo Support", "available", all(INCLUDED)),
          feature(
            "webhook-triggers",
            "Webhook Triggers",
            "available",
            values(text("1 integration"), text("Up to 10"), CUSTOM),
          ),
          feature(
            "custom-environments",
            "Custom Environments",
            "preview",
            values(EXCLUDED, PREVIEW, PREVIEW),
          ),
        ]),
        group("build-minutes", "Build Minutes", [
          feature(
            "standard-machines",
            "Standard Machines",
            "available",
            values(
              text("100 min / month", "hard limit"),
              text("500 min / month", "then $0.02 per minute"),
              CUSTOM,
            ),
          ),
          feature(
            "enhanced-machines",
            "Enhanced Machines",
            "infrastructureRequired",
            all(ROADMAP),
          ),
          feature(
            "turbo-machines",
            "Turbo Machines",
            "infrastructureRequired",
            all(ROADMAP),
          ),
          feature(
            "elastic-machines",
            "Elastic Machines",
            "infrastructureRequired",
            all(ROADMAP),
          ),
        ]),
        group("deployments", "Deployments", [
          feature(
            "unlimited-deployments",
            "Unlimited Deployments",
            "available",
            all(INCLUDED),
          ),
          feature(
            "instant-rollback",
            "Instant Rollback",
            "available",
            all(INCLUDED),
          ),
          feature(
            "multi-tenant",
            "Multi-tenant Support",
            "preview",
            values(EXCLUDED, PREVIEW, PREVIEW),
          ),
          feature(
            "skew-protection",
            "Skew Protection",
            "infrastructureRequired",
            all(ROADMAP),
          ),
          feature(
            "rolling-releases",
            "Rolling Releases",
            "infrastructureRequired",
            all(ROADMAP),
          ),
          feature(
            "preview-suffix",
            "Preview Deployment Suffix",
            "infrastructureRequired",
            all(ROADMAP),
          ),
        ]),
      ],
    ),
    section(
      "collaboration-toolbar",
      "Collaboration & Multivrs Toolbar",
      "Team access and in-context tools for reviewing every release.",
      [
        group("team-seats", "Team Seats", [
          feature(
            "developer-seat",
            "Developer Seat",
            "infrastructureRequired",
            all(ROADMAP),
          ),
          feature(
            "viewer-seat",
            "Viewer Seat",
            "infrastructureRequired",
            all(ROADMAP),
          ),
          feature(
            "billing-seat",
            "Billing Seat",
            "infrastructureRequired",
            all(ROADMAP),
          ),
        ]),
        group("toolbar", "Multivrs Toolbar", [
          feature(
            "comments",
            "Comments",
            "infrastructureRequired",
            all(ROADMAP),
          ),
          feature(
            "layout-shift-tool",
            "Layout Shift Tool",
            "preview",
            all(PREVIEW),
          ),
          feature("draft-mode", "Draft Mode", "available", all(INCLUDED)),
          feature(
            "productivity-integrations",
            "Productivity Integrations",
            "preview",
            values(EXCLUDED, PREVIEW, PREVIEW),
          ),
          feature(
            "previewers",
            "Previewers",
            "infrastructureRequired",
            all(ROADMAP),
          ),
          feature(
            "accessibility-audit",
            "Accessibility Audit",
            "infrastructureRequired",
            all(ROADMAP),
          ),
          feature(
            "flags-explorer",
            "Flags Explorer",
            "infrastructureRequired",
            all(ROADMAP),
          ),
          feature(
            "multivrs-flags",
            "Multivrs Flags",
            "infrastructureRequired",
            all(ROADMAP),
          ),
        ]),
      ],
    ),
    section(
      "mail",
      "Multivrs Mail",
      "Two-way transactional mailboxes, sending domains, inbound delivery, and message operations.",
      [
        group("mailboxes", "Mailboxes & domains", [
          feature(
            "mailboxes",
            "Mailboxes",
            "available",
            values(text("1 mailbox"), text("5 mailboxes"), CUSTOM),
          ),
          feature(
            "mail-aliases",
            "Mailbox aliases",
            "available",
            values(text("3 aliases"), text("25 aliases"), CUSTOM),
          ),
          feature(
            "mail-domains",
            "Custom sending & receiving domains",
            "available",
            values(text("1 domain"), text("3 domains"), CUSTOM),
          ),
          feature(
            "shared-mailboxes",
            "Shared mailbox members",
            "available",
            values(EXCLUDED, text("Up to 5 per mailbox"), CUSTOM),
          ),
          feature(
            "automatic-mail-dns",
            "Automatic SPF, DKIM, DMARC & MX setup",
            "available",
            all(INCLUDED),
            "DNS records are installed automatically for Multivrs-managed domains and displayed for external DNS providers.",
          ),
        ]),
        group("mail-delivery", "Sending & receiving", [
          feature("two-way-mail", "Two-way email", "available", all(INCLUDED)),
          feature(
            "mail-volume",
            "Emails sent & received",
            "available",
            values(
              text("100 / month", "hard limit"),
              text(
                "500 / month included",
                `then ${dollars(rate.resendMessages.retailPriceUsd)} per 1K`,
              ),
              CUSTOM,
            ),
            "Each outbound recipient and each inbound message counts as one email unit.",
          ),
          feature(
            "mail-volume-add-on",
            "Mail volume add-on",
            "available",
            values(
              EXCLUDED,
              text(
                `${RECOMMENDED_PLAN_ECONOMICS.mailAddOn.includedMessages / 1_000}K emails for $${RECOMMENDED_PLAN_ECONOMICS.mailAddOn.monthlyPriceUsd} / month`,
                "then $2 per 1K",
              ),
              CUSTOM,
            ),
          ),
          feature(
            "mail-api-smtp",
            "REST API & SMTP submission",
            "available",
            values(text("REST API"), text("REST API & SMTP"), INCLUDED),
          ),
          feature(
            "scheduled-mail",
            "Scheduled sending",
            "available",
            values(EXCLUDED, INCLUDED, INCLUDED),
          ),
          feature(
            "mail-attachments",
            "Attachments",
            "available",
            values(
              text("10 MB per message"),
              text("10 MB per message"),
              CUSTOM,
            ),
            "Multivrs currently enforces a 10 MB attachment total per message.",
          ),
        ]),
        group("mail-operations", "Operations & deliverability", [
          feature(
            "mail-events",
            "Delivery, bounce & complaint events",
            "available",
            all(INCLUDED),
          ),
          feature(
            "mail-suppressions",
            "Suppression management",
            "available",
            all(INCLUDED),
          ),
          feature(
            "mail-templates",
            "Reusable templates",
            "available",
            values(text("3 templates"), INCLUDED, INCLUDED),
          ),
          feature(
            "mail-broadcasts",
            "Audiences & broadcasts",
            "available",
            values(EXCLUDED, INCLUDED, INCLUDED),
          ),
          feature(
            "mail-automations",
            "Email automations",
            "available",
            values(EXCLUDED, INCLUDED, INCLUDED),
          ),
          feature(
            "mail-webhooks",
            "Signed event webhooks",
            "available",
            values(text("1 endpoint"), text("10 endpoints"), CUSTOM),
          ),
        ]),
      ],
    ),
    section(
      "observability",
      "Observability",
      "First-party usage, performance, analytics, traces, and runtime diagnostics.",
      [
        feature(
          "usage-dashboard",
          "Usage Dashboard",
          "available",
          all(INCLUDED),
        ),
        feature(
          "observability-core",
          "Observability",
          "available",
          values(text("24 hour window"), text("7 day window"), CUSTOM),
        ),
        group("observability-plus", "Observability Plus", [
          feature(
            "extended-retention",
            "Extended Retention",
            "preview",
            values(EXCLUDED, PREVIEW, PREVIEW),
          ),
          feature(
            "advanced-metrics",
            "Advanced Metrics",
            "preview",
            values(EXCLUDED, PREVIEW, PREVIEW),
          ),
          feature(
            "query-engine",
            "Query Engine",
            "preview",
            values(EXCLUDED, PREVIEW, PREVIEW),
          ),
          feature(
            "alerts",
            "Alerts",
            "preview",
            values(EXCLUDED, PREVIEW, PREVIEW),
          ),
        ]),
        feature(
          "speed-insights",
          "Speed Insights",
          "available",
          values(
            text("10K vitals / month", "hard limit"),
            text("100K vitals / month", "then $0.75 per 1M events"),
            CUSTOM,
          ),
        ),
        feature(
          "web-analytics",
          "Web Analytics",
          "available",
          values(
            text("100K events / month", "hard limit"),
            text(
              "1M events / month",
              `then ${dollars(rate.analyticsWrites.retailPriceUsd)} per 1M`,
            ),
            CUSTOM,
          ),
        ),
        group("web-analytics-plus", "Web Analytics Plus", [
          feature(
            "reporting-windows",
            "Reporting Windows",
            "available",
            values(text("24 hours"), text("30 days"), CUSTOM),
          ),
          feature(
            "utm-parameters",
            "UTM Parameters",
            "available",
            values(EXCLUDED, INCLUDED, INCLUDED),
          ),
        ]),
        feature(
          "runtime-logs",
          "Runtime Logs",
          "available",
          values(text("1 day retention"), text("7 day retention"), CUSTOM),
        ),
        feature(
          "session-tracing",
          "Session Tracing",
          "preview",
          values(EXCLUDED, PREVIEW, PREVIEW),
        ),
        feature(
          "log-drains",
          "Log Drains",
          "preview",
          values(EXCLUDED, text("1 drain · Preview"), PREVIEW),
        ),
      ],
    ),
    section(
      "access-security",
      "Access, Security & Compliance",
      "Identity controls, protected deployments, and transparent compliance status.",
      [
        group("access-security-controls", "Access Security", [
          feature(
            "mfa",
            "Multi-Factor Authentication (MFA)",
            "available",
            all(INCLUDED),
          ),
          feature(
            "rbac",
            "Role-Based Access Control",
            "preview",
            values(EXCLUDED, PREVIEW, PREVIEW),
          ),
          feature(
            "audit-logs",
            "Audit Logs",
            "available",
            values(text("1 day retention"), text("30 day retention"), CUSTOM),
          ),
          feature(
            "saml",
            "SAML Single Sign-On (SSO)",
            "infrastructureRequired",
            all(ROADMAP),
          ),
          feature(
            "scim",
            "Directory Sync (SCIM)",
            "infrastructureRequired",
            all(ROADMAP),
          ),
        ]),
        group("deployment-protection", "Deployment Protection", [
          feature(
            "advanced-deployment-protection",
            "Advanced Deployment Protection",
            "infrastructureRequired",
            all(ROADMAP),
          ),
          feature(
            "sso-previews",
            "SSO Protected Previews",
            "infrastructureRequired",
            all(ROADMAP),
          ),
          feature(
            "static-ips",
            "Static IPs",
            "infrastructureRequired",
            all(ROADMAP),
          ),
          feature(
            "secure-compute",
            "Secure Compute",
            "preview",
            values(EXCLUDED, PREVIEW, PREVIEW),
          ),
          feature("byoc", "BYOC", "infrastructureRequired", all(ROADMAP)),
        ]),
        group("compliance", "Compliance", [
          feature(
            "soc2",
            "SOC 2 Type 2",
            "infrastructureRequired",
            all(EXCLUDED),
          ),
          feature("pci", "PCI DSS", "infrastructureRequired", all(EXCLUDED)),
          feature(
            "iso27001",
            "ISO 27001",
            "infrastructureRequired",
            all(EXCLUDED),
          ),
          feature(
            "dpf",
            "EU-U.S. DPF",
            "infrastructureRequired",
            all(EXCLUDED),
          ),
          feature(
            "hipaa",
            "HIPAA BAA",
            "infrastructureRequired",
            all(EXCLUDED),
          ),
          feature("tisax", "TISAX", "infrastructureRequired", all(EXCLUDED)),
          feature(
            "security-questionnaire",
            "Custom Security Questionnaire",
            "available",
            values(EXCLUDED, EXCLUDED, INCLUDED),
          ),
        ]),
      ],
    ),
  ],
};

export const recommendedPricingComparisonInitialValue = comparison;

export const recommendedPricingComparison: PricingComparison = {
  _id: "pricingComparison",
  _type: "pricingComparison",
  ...comparison,
};
