"use client";

import {
  Boxes,
  Check,
  CircleHelp,
  CloudCog,
  CodeXml,
  Eye,
  Gauge,
  HardDrive,
  Mail,
  Minus,
  Search,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import type {
  PricingComparison,
  PricingFeature,
  PricingFeatureGroup,
  PricingPlanKey,
  PricingPlanValue,
  PricingSection,
  PricingSectionItem,
} from "@/sanity/lib/pricing-comparison.types";

const SECTION_ICONS = {
  "access-security": ShieldCheck,
  "build-deployments": CodeXml,
  "collaboration-toolbar": Users,
  compute: Boxes,
  "content-caching-optimization": HardDrive,
  "delivery-network": CloudCog,
  firewall: ShieldCheck,
  mail: Mail,
  observability: Eye,
} as const;

function normalized(value: string | undefined): string {
  return value?.trim().toLocaleLowerCase() ?? "";
}

function featureMatches(feature: PricingFeature, query: string): boolean {
  return (
    normalized(feature.name).includes(query) ||
    normalized(feature.description).includes(query) ||
    feature.values.some(
      (value) =>
        normalized(value.value).includes(query) ||
        normalized(value.note).includes(query),
    )
  );
}

function filterGroup(
  group: PricingFeatureGroup,
  query: string,
): PricingFeatureGroup | null {
  if (
    normalized(group.title).includes(query) ||
    normalized(group.description).includes(query)
  ) {
    return group;
  }
  const features = group.features.filter((feature) =>
    featureMatches(feature, query),
  );
  return features.length ? { ...group, features } : null;
}

function filterSection(
  section: PricingSection,
  query: string,
): PricingSection | null {
  if (
    normalized(section.title).includes(query) ||
    normalized(section.description).includes(query)
  ) {
    return section;
  }
  const items: PricingSectionItem[] = [];
  for (const item of section.items) {
    if (item._type === "pricingFeatureGroup") {
      const match = filterGroup(item, query);
      if (match) items.push(match);
      continue;
    }
    if (featureMatches(item, query)) items.push(item);
  }
  return items.length ? { ...section, items } : null;
}

function PricingValue({ value }: { value?: PricingPlanValue }) {
  const publicValue = value?.value
    ?.replace(/\s*[·-]\s*Preview\s*$/i, "")
    .trim();
  const publicNote = value?.note
    ?.replace(/^Preview\s*[·-]\s*/i, "")
    .replace(/^Preview$/i, "")
    .trim();
  const isUnavailable =
    !value ||
    value.kind === "excluded" ||
    value.kind === "comingSoon" ||
    normalized(publicValue) === "roadmap";

  if (isUnavailable) {
    return (
      <span className="inline-flex items-center text-muted-foreground/60">
        <Minus aria-hidden="true" className="size-4" />
        <span className="sr-only">Not included</span>
      </span>
    );
  }
  if (value.kind === "included" || normalized(publicValue) === "preview") {
    return (
      <span className="inline-flex items-center text-foreground/70">
        <Check aria-hidden="true" className="size-4" strokeWidth={1.8} />
        <span className="sr-only">Included</span>
      </span>
    );
  }

  const primary =
    publicValue || (value.kind === "custom" ? "Custom" : "Included");

  return (
    <span className="block max-w-56 text-balance">
      <span className="text-sm text-foreground/80">{primary}</span>
      {publicNote ? (
        <span className="mt-1 block text-xs leading-5 text-muted-foreground">
          {publicNote}
        </span>
      ) : null}
    </span>
  );
}

function FeatureName({ feature }: { feature: PricingFeature }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <span className="min-w-0 text-sm text-foreground/75">{feature.name}</span>
      {feature.description ? (
        <button
          aria-label={feature.description}
          className="group/info relative inline-flex shrink-0 text-left outline-none"
          type="button"
        >
          <CircleHelp
            aria-hidden="true"
            className="size-3.5 text-muted-foreground/70 transition-colors group-hover/info:text-foreground group-focus/info:text-foreground"
          />
          <span
            className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden w-64 -translate-x-1/2 border border-border bg-popover px-3 py-2 text-left text-xs font-normal leading-5 text-popover-foreground shadow-xl group-hover/info:block group-focus/info:block"
            role="tooltip"
          >
            {feature.description}
          </span>
        </button>
      ) : null}
    </div>
  );
}

function FeatureRow({
  feature,
  planKeys,
}: {
  feature: PricingFeature;
  planKeys: PricingPlanKey[];
}) {
  return (
    <tr className="group/row border-b border-border/65 last:border-b-0">
      <th
        className="sticky left-0 z-10 bg-background px-0 py-5 pr-6 text-left font-normal transition-colors group-hover/row:bg-muted/10"
        scope="row"
      >
        <FeatureName feature={feature} />
      </th>
      {planKeys.map((planKey) => (
        <td
          className="px-6 py-5 align-middle transition-colors group-hover/row:bg-muted/10"
          key={planKey}
        >
          <PricingValue
            value={feature.values.find((value) => value.planKey === planKey)}
          />
        </td>
      ))}
    </tr>
  );
}

function GroupRows({
  group,
  planKeys,
}: {
  group: PricingFeatureGroup;
  planKeys: PricingPlanKey[];
}) {
  return (
    <>
      <tr className="border-b border-border/75">
        <th
          className="sticky left-0 z-10 bg-background pb-3 pt-7 text-left text-xs font-medium uppercase tracking-[0.12em] text-foreground/75"
          colSpan={1}
          scope="rowgroup"
        >
          {group.title}
          {group.description ? (
            <span className="ml-2 normal-case tracking-normal text-muted-foreground">
              {group.description}
            </span>
          ) : null}
        </th>
        <td className="pb-3 pt-7" colSpan={planKeys.length} />
      </tr>
      {group.features.map((feature) => (
        <FeatureRow feature={feature} key={feature._key} planKeys={planKeys} />
      ))}
    </>
  );
}

export function PricingComparisonTable({
  comparison,
}: {
  comparison: PricingComparison;
}) {
  const [search, setSearch] = useState("");
  const query = normalized(search);
  const filteredSections = query
    ? comparison.sections.flatMap((section) => {
        const match = filterSection(section, query);
        return match ? [match] : [];
      })
    : comparison.sections;
  const planKeys = comparison.plans.map((plan) => plan.key);

  return (
    <section
      aria-labelledby="pricing-comparison-title"
      className="border-t border-border bg-background py-24 text-foreground lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-14 max-w-3xl lg:mb-20">
          <div className="mb-5 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            <Gauge aria-hidden="true" className="size-4" />
            Platform comparison
          </div>
          <h2
            className="text-balance text-3xl font-medium tracking-tight sm:text-4xl lg:text-5xl"
            id="pricing-comparison-title"
          >
            {comparison.title}
          </h2>
          <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-muted-foreground">
            {comparison.description}
          </p>
        </div>

        <div className="overflow-x-auto overscroll-x-contain border-y border-border">
          <table className="w-full min-w-245 table-fixed border-collapse">
            <caption className="sr-only">
              Multivrs plan features and monthly usage allowances
            </caption>
            <colgroup>
              <col className="w-[38%]" />
              {comparison.plans.map((plan) => (
                <col className="w-[20.666%]" key={plan._key} />
              ))}
            </colgroup>
            <thead className="sticky top-16 z-30 bg-background/95 backdrop-blur-xl">
              <tr className="border-b border-border">
                <th className="sticky left-0 z-40 bg-background/95 py-4 pr-8 text-left font-normal">
                  <label
                    className="relative block max-w-80"
                    htmlFor="feature-search"
                  >
                    <span className="sr-only">Search pricing features</span>
                    <Search
                      aria-hidden="true"
                      className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                      className="h-10 w-full border border-border bg-background pl-10 pr-10 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/40"
                      id="feature-search"
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder={comparison.searchPlaceholder}
                      type="search"
                      value={search}
                    />
                    {search ? (
                      <button
                        aria-label="Clear feature search"
                        className="absolute right-1 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                        onClick={() => setSearch("")}
                        type="button"
                      >
                        <X aria-hidden="true" className="size-4" />
                      </button>
                    ) : null}
                  </label>
                </th>
                {comparison.plans.map((plan) => (
                  <th
                    className="px-6 py-4 text-left font-normal"
                    key={plan._key}
                    scope="col"
                  >
                    <span className="block text-lg font-medium tracking-tight">
                      {plan.name}
                    </span>
                    {plan.description ? (
                      <span className="mt-1 block text-xs font-normal leading-5 text-muted-foreground">
                        {plan.description}
                      </span>
                    ) : null}
                  </th>
                ))}
              </tr>
            </thead>

            {filteredSections.map((section) => {
              const Icon =
                SECTION_ICONS[
                  section.slug.current as keyof typeof SECTION_ICONS
                ] ?? Boxes;
              return (
                <tbody key={section._key}>
                  <tr>
                    <th className="px-0 pb-7 pt-20 text-left" colSpan={4}>
                      <div className="flex items-start gap-3">
                        <Icon
                          aria-hidden="true"
                          className="mt-1 size-5 text-foreground/80"
                          strokeWidth={1.6}
                        />
                        <div>
                          <h3 className="text-xl font-medium tracking-tight sm:text-2xl">
                            {section.title}
                          </h3>
                          <p className="mt-2 max-w-2xl text-sm font-normal leading-6 text-muted-foreground">
                            {section.description}
                          </p>
                        </div>
                      </div>
                    </th>
                  </tr>
                  {section.items.map((item) =>
                    item._type === "pricingFeatureGroup" ? (
                      <GroupRows
                        group={item}
                        key={item._key}
                        planKeys={planKeys}
                      />
                    ) : (
                      <FeatureRow
                        feature={item}
                        key={item._key}
                        planKeys={planKeys}
                      />
                    ),
                  )}
                </tbody>
              );
            })}
          </table>

          {!filteredSections.length ? (
            <div className="flex min-h-72 flex-col items-center justify-center border-t border-border px-6 text-center">
              <Search
                aria-hidden="true"
                className="size-5 text-muted-foreground"
              />
              <p className="mt-4 text-sm text-foreground/80">
                No pricing features match “{search}”.
              </p>
              <button
                className="mt-3 text-sm text-muted-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground"
                onClick={() => setSearch("")}
                type="button"
              >
                Clear search
              </button>
            </div>
          ) : null}
        </div>

        <p className="mt-6 max-w-3xl text-xs leading-5 text-muted-foreground">
          Usage overages require spend controls and metered billing to be
          enabled. Hobby limits stop instead of creating a bill. Mail usage
          counts every outbound recipient and every received message.
        </p>
      </div>
    </section>
  );
}
