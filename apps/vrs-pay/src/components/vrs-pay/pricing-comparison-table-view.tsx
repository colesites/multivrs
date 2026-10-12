// Rendered inside the BillingShowcase island, so no "use client" here: a
// nested island makes the server wrap it in markup the showcase doesn't render.
import React, { Fragment } from "react";
import type { ComparisonPlan, ComparisonSection } from "./types";
import { type VrsAppearance, appearanceToStyle } from "./appearance";

export interface PricingComparisonTableClassNames {
  wrapper?: string;
  table?: string;
  headerRow?: string;
  cornerCell?: string;
  planCol?: string;
  planHeader?: string;
  badge?: string;
  name?: string;
  priceWrap?: string;
  price?: string;
  period?: string;
  description?: string;
  ctaButton?: string;
  sectionHeader?: string;
  sectionTitle?: string;
  sectionDesc?: string;
  row?: string;
  featureCell?: string;
  featureName?: string;
  featureDesc?: string;
  cell?: string;
  checkIcon?: string;
  dashIcon?: string;
}

export interface PricingComparisonTableViewProps {
  plans: ComparisonPlan[];
  sections: ComparisonSection[];
  onChoose?: (plan: ComparisonPlan) => void;
  busyPlanId?: string | null;
  className?: string;
  appearance?: VrsAppearance;
  classNames?: PricingComparisonTableClassNames;
  renderCell?: (
    value: boolean | string | number | React.ReactNode,
    plan: ComparisonPlan,
  ) => React.ReactNode;
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={`size-4 inline-block ${className ?? "text-[#6936f5]"}`.trim()}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.8}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg
      className={`size-3.5 inline-block text-neutral-300 hover:text-neutral-500 transition-colors cursor-help ${className ?? ""}`.trim()}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function PricingComparisonTableView({
  plans,
  sections,
  onChoose,
  busyPlanId,
  className,
  appearance,
  classNames = {},
  renderCell,
}: PricingComparisonTableViewProps) {
  const customStyle = appearanceToStyle(appearance);
  const themeAttr = appearance?.theme;

  return (
    <div
      className={`vrs-comparison-wrapper w-full overflow-hidden rounded-[28px] border border-neutral-200/80 bg-white shadow-[0_4px_24px_-6px_rgba(0,0,0,0.04)] ${className ?? ""} ${classNames.wrapper ?? ""}`.trim()}
      style={customStyle}
      data-vrs-theme={themeAttr}
    >
      <div className="overflow-x-auto">
        <table className={`w-full border-collapse text-left ${classNames.table ?? ""}`.trim()}>
          {/* Table Header: Plan titles, prices, CTAs */}
          <thead>
            <tr className={`border-b border-neutral-200/80 ${classNames.headerRow ?? ""}`.trim()}>
              <th
                scope="col"
                className={`w-2/5 min-w-[240px] p-6 sm:p-8 align-bottom ${classNames.cornerCell ?? ""}`.trim()}
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-neutral-400">
                    Feature Comparison
                  </span>
                  <h3 className="text-xl font-bold tracking-tight text-neutral-900">
                    Compare all plan features
                  </h3>
                </div>
              </th>

              {plans.map((plan) => (
                <th
                  key={plan.id}
                  scope="col"
                  className={`min-w-[180px] p-6 sm:p-8 text-center align-bottom transition-colors ${
                    plan.highlighted ? "bg-[#6936f5]/[0.02]" : ""
                  } ${classNames.planCol ?? ""}`.trim()}
                >
                  <div className={`flex flex-col items-center text-center ${classNames.planHeader ?? ""}`.trim()}>
                    {/* Badge */}
                    {plan.highlighted && (
                      <span
                        className={`mb-3 inline-block rounded-full px-2.5 py-0.5 text-[9px] font-bold tracking-wider uppercase text-white ${classNames.badge ?? ""}`.trim()}
                        style={{ backgroundColor: "var(--vrs-accent, #6936f5)" }}
                      >
                        {plan.badge ?? "POPULAR"}
                      </span>
                    )}

                    {/* Plan Name */}
                    <h4 className={`text-base font-bold text-neutral-900 ${classNames.name ?? ""}`.trim()}>
                      {plan.name}
                    </h4>

                    {/* Description / Subtitle */}
                    {plan.description && (
                      <p className={`mt-1 text-[11px] text-neutral-500 font-normal min-h-[32px] ${classNames.description ?? ""}`.trim()}>
                        {plan.description}
                      </p>
                    )}

                    {/* Price */}
                    {plan.price && (
                      <div className={`mt-3 flex items-baseline justify-center gap-1 ${classNames.priceWrap ?? ""}`.trim()}>
                        <span className={`text-2xl font-extrabold tracking-tight text-neutral-900 ${classNames.price ?? ""}`.trim()}>
                          {plan.price}
                        </span>
                        {plan.period && (
                          <span className={`text-xs text-neutral-400 font-normal ${classNames.period ?? ""}`.trim()}>
                            {plan.period}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Pill Action Button */}
                    {onChoose && (
                      <button
                        type="button"
                        disabled={plan.disabled || busyPlanId === plan.id}
                        onClick={() => onChoose(plan)}
                        className={`mt-5 w-full max-w-[150px] rounded-full py-2 px-4 text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                          plan.highlighted
                            ? "text-white shadow-xs hover:shadow-md hover:brightness-105"
                            : "border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50 hover:border-neutral-400"
                        } ${classNames.ctaButton ?? ""}`.trim()}
                        style={{
                          backgroundColor: plan.highlighted ? "var(--vrs-accent, #6936f5)" : undefined,
                        }}
                      >
                        {busyPlanId === plan.id
                          ? "Opening..."
                          : plan.ctaText ?? (plan.highlighted ? "Get Plus" : "Start free")}
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body: Categorized Feature Matrix */}
          <tbody>
            {sections.map((section, sIndex) => (
              <Fragment key={sIndex}>
                {/* Category Header Row Band */}
                <tr className={`border-y border-neutral-200/80 bg-[#f9f9f8] ${classNames.sectionHeader ?? ""}`.trim()}>
                  <td
                    colSpan={plans.length + 1}
                    className="py-3 px-6 sm:px-8"
                  >
                    <p className={`text-[10.5px] font-bold tracking-widest uppercase text-neutral-500 ${classNames.sectionTitle ?? ""}`.trim()}>
                      {section.title}
                    </p>
                    {section.description && (
                      <p className={`text-[11px] text-neutral-400 font-normal mt-0.5 ${classNames.sectionDesc ?? ""}`.trim()}>
                        {section.description}
                      </p>
                    )}
                  </td>
                </tr>

                {/* Feature Rows */}
                {section.rows.map((row, rIndex) => (
                  <tr
                    key={rIndex}
                    className={`border-b border-neutral-100 hover:bg-neutral-50/60 transition-colors ${classNames.row ?? ""}`.trim()}
                  >
                    {/* Feature Label & Info */}
                    <th
                      scope="row"
                      className={`p-4 sm:px-8 sm:py-4.5 font-normal ${classNames.featureCell ?? ""}`.trim()}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium text-neutral-800 ${classNames.featureName ?? ""}`.trim()}>
                          {row.name}
                        </span>
                        {row.description && (
                          <span title={row.description}>
                            <InfoIcon />
                          </span>
                        )}
                      </div>
                    </th>

                    {/* Feature Values per Plan */}
                    {plans.map((plan) => {
                      const value = row.values[plan.id];
                      return (
                        <td
                          key={plan.id}
                          className={`p-4 sm:px-8 sm:py-4.5 text-center text-xs text-neutral-600 transition-colors ${
                            plan.highlighted ? "bg-[#6936f5]/[0.02]" : ""
                          } ${classNames.cell ?? ""}`.trim()}
                        >
                          {renderCell ? (
                            renderCell(value, plan)
                          ) : typeof value === "boolean" ? (
                            value ? (
                              <CheckIcon className={classNames.checkIcon} />
                            ) : (
                              <span className={`text-neutral-300 font-light text-base select-none ${classNames.dashIcon ?? ""}`.trim()}>
                                &mdash;
                              </span>
                            )
                          ) : (
                            <span className="font-medium text-neutral-800">{value}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
