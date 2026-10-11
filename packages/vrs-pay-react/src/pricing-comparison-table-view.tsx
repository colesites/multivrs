import { Fragment, type ReactNode } from "react";
import { type VrsAppearance, appearanceToStyle } from "./appearance";

export interface ComparisonPlan {
  id: string;
  name: string;
  price?: string;
  period?: string;
  description?: string;
  badge?: string;
  ctaText?: string;
  highlighted?: boolean;
  disabled?: boolean;
}

export interface ComparisonFeatureRow {
  name: string;
  description?: string;
  tooltip?: string;
  /** Value per plan id: boolean (check/dash), string, number, or custom React node. */
  values: Record<string, boolean | string | number | ReactNode>;
}

export interface ComparisonSection {
  title: string;
  description?: string;
  rows: ComparisonFeatureRow[];
}

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
    value: boolean | string | number | ReactNode,
    plan: ComparisonPlan,
  ) => ReactNode;
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={`vrs-comparison-check ${className ?? ""}`.trim()}
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function DashIcon({ className }: { className?: string }) {
  return (
    <span
      role="img"
      className={`vrs-comparison-dash ${className ?? ""}`.trim()}
      aria-label="Not included"
    >
      —
    </span>
  );
}

function InfoIcon() {
  return (
    <svg
      className="vrs-comparison-info-icon"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
      style={{ width: "14px", height: "14px", opacity: 0.45, display: "inline-block", verticalAlign: "middle", marginLeft: "4px" }}
    >
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
        clipRule="evenodd"
      />
    </svg>
  );
}

/**
 * Pure presenter for the detailed pricing feature comparison matrix table.
 */
export function PricingComparisonTableView(props: PricingComparisonTableViewProps) {
  const {
    plans,
    sections,
    onChoose,
    busyPlanId,
    className,
    appearance,
    classNames = {},
    renderCell,
  } = props;

  const style = appearanceToStyle(appearance);
  const themeAttr = appearance?.theme && appearance.theme !== "auto" ? appearance.theme : undefined;

  return (
    <div
      className={`vrs-comparison-wrapper ${className ?? ""} ${classNames.wrapper ?? ""}`.trim()}
      style={style}
      data-vrs-theme={themeAttr}
    >
      <table className={`vrs-comparison-table ${classNames.table ?? ""}`.trim()}>
        <thead>
          <tr className={`vrs-comparison-header-row ${classNames.headerRow ?? ""}`.trim()}>
            <th className={`vrs-comparison-corner-cell ${classNames.cornerCell ?? ""}`.trim()} scope="col">
              <span className="vrs-comparison-corner-title">Features</span>
            </th>
            {plans.map((plan) => (
              <th
                key={plan.id}
                className={`vrs-comparison-plan-col ${
                  plan.highlighted ? "vrs-comparison-plan-highlighted" : ""
                } ${classNames.planCol ?? ""}`.trim()}
                scope="col"
              >
                <div className={`vrs-comparison-plan-header ${classNames.planHeader ?? ""}`.trim()}>
                  {plan.badge && (
                    <span className={`vrs-comparison-badge ${classNames.badge ?? ""}`.trim()}>
                      {plan.badge}
                    </span>
                  )}
                  <h3 className={`vrs-comparison-plan-name ${classNames.name ?? ""}`.trim()}>
                    {plan.name}
                  </h3>
                  {plan.price && (
                    <div className={`vrs-comparison-plan-price-wrap ${classNames.priceWrap ?? ""}`.trim()}>
                      <span className={`vrs-comparison-plan-price ${classNames.price ?? ""}`.trim()}>
                        {plan.price}
                      </span>
                      {plan.period && (
                        <span className={`vrs-comparison-plan-period ${classNames.period ?? ""}`.trim()}>
                          {plan.period}
                        </span>
                      )}
                    </div>
                  )}
                  {plan.description && (
                    <p className={`vrs-comparison-plan-description ${classNames.description ?? ""}`.trim()}>
                      {plan.description}
                    </p>
                  )}
                  {onChoose && (
                    <button
                      type="button"
                      className={`vrs-button ${
                        plan.highlighted ? "" : "vrs-button-quiet"
                      } ${classNames.ctaButton ?? ""}`.trim()}
                      disabled={plan.disabled || busyPlanId === plan.id}
                      onClick={() => onChoose(plan)}
                    >
                      {busyPlanId === plan.id
                        ? "Opening..."
                        : plan.ctaText ?? (plan.highlighted ? "Get started" : "Choose plan")}
                    </button>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sections.map((section) => (
            <Fragment key={`section-${section.title}`}>
              <tr className={`vrs-comparison-section-group ${classNames.sectionHeader ?? ""}`.trim()}>
                <td colSpan={plans.length + 1} className="vrs-comparison-section-cell">
                  <div className="vrs-comparison-section-heading">
                    <h4 className={`vrs-comparison-section-title ${classNames.sectionTitle ?? ""}`.trim()}>
                      {section.title}
                    </h4>
                    {section.description && (
                      <p className={`vrs-comparison-section-desc ${classNames.sectionDesc ?? ""}`.trim()}>
                        {section.description}
                      </p>
                    )}
                  </div>
                </td>
              </tr>
              {section.rows.map((row) => (
                <tr key={`${section.title}-${row.name}`} className={`vrs-comparison-row ${classNames.row ?? ""}`.trim()}>
                  <th className={`vrs-comparison-feature-cell ${classNames.featureCell ?? ""}`.trim()} scope="row">
                    <div className="vrs-comparison-feature-content">
                      <span className={`vrs-comparison-feature-name ${classNames.featureName ?? ""}`.trim()}>
                        {row.name}
                      </span>
                      {row.description && (
                        <span title={row.description}>
                          <InfoIcon />
                        </span>
                      )}
                    </div>
                  </th>
                  {plans.map((plan) => {
                    const val = row.values[plan.id];
                    return (
                      <td
                        key={plan.id}
                        className={`vrs-comparison-cell ${
                          plan.highlighted ? "vrs-comparison-cell-highlighted" : ""
                        } ${classNames.cell ?? ""}`.trim()}
                      >
                        {renderCell ? (
                          renderCell(val, plan)
                        ) : typeof val === "boolean" ? (
                          val ? (
                            <CheckIcon className={classNames.checkIcon} />
                          ) : (
                            <DashIcon className={classNames.dashIcon} />
                          )
                        ) : val !== undefined && val !== null ? (
                          <span className="vrs-comparison-value">{val}</span>
                        ) : (
                          <DashIcon className={classNames.dashIcon} />
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
  );
}
