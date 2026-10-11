import { formatPrice, type PricingPrice, type PricingProduct } from "@vrs-pay/js";
import { type VrsAppearance, appearanceToStyle } from "./appearance";
import { type PeriodKey, periodLabel, priceFor } from "./price-choice";

export interface PricingTableClassNames {
  wrapper?: string;
  periods?: string;
  periodButton?: string;
  periodButtonActive?: string;
  plans?: string;
  card?: string;
  highlightedCard?: string;
  badge?: string;
  name?: string;
  description?: string;
  priceWrap?: string;
  price?: string;
  periodLabel?: string;
  trial?: string;
  features?: string;
  featureItem?: string;
  featureIcon?: string;
  button?: string;
  buttonHighlighted?: string;
}

export interface PricingTableViewProps {
  products: PricingProduct[];
  periods: PeriodKey[];
  period: PeriodKey | null;
  onPeriodChange: (period: PeriodKey) => void;
  onChoose: (price: PricingPrice, product: PricingProduct) => void;
  currency?: string;
  /** Product ID to highlight (or will pick product marked highlighted/recommended). */
  highlightedId?: string | null;
  /** Custom badge text for the highlighted product (e.g. "Most Popular"). */
  highlightedBadge?: string;
  /** The price whose checkout is opening. */
  busyPrice?: string | null;
  error?: string | null;
  className?: string;
  /** High-level theming props (accent, radius, theme). */
  appearance?: VrsAppearance;
  /** Direct class name overrides for every UI element. */
  classNames?: PricingTableClassNames;
  /** Custom render slots for full control. */
  renderCta?: (props: {
    price: PricingPrice;
    product: PricingProduct;
    busy: boolean;
    onChoose: () => void;
  }) => React.ReactNode;
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={`vrs-check-icon ${className ?? ""}`.trim()}
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

/**
 * Ultra-premium Pricing Table presenter.
 * Fully customizable via appearance tokens, slot classNames, and render props.
 */
export function PricingTableView(props: PricingTableViewProps) {
  const {
    products,
    periods,
    period,
    currency,
    busyPrice,
    error,
    highlightedId,
    highlightedBadge = "Most popular",
    appearance,
    classNames = {},
    renderCta,
  } = props;

  const style = appearanceToStyle(appearance);
  const themeAttr = appearance?.theme && appearance.theme !== "auto" ? appearance.theme : undefined;

  return (
    <div
      className={`vrs-pricing ${props.className ?? ""} ${classNames.wrapper ?? ""}`.trim()}
      style={style}
      data-vrs-theme={themeAttr}
    >
      {periods.length > 1 && (
        <div className="vrs-pricing-periods-wrapper">
          <div className={`vrs-pricing-periods ${classNames.periods ?? ""}`.trim()} role="tablist">
            {periods.map((key) => {
              const active = key === period;
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={`vrs-pricing-period ${
                    classNames.periodButton ?? ""
                  } ${active ? classNames.periodButtonActive ?? "" : ""}`.trim()}
                  onClick={() => props.onPeriodChange(key)}
                >
                  {periodLabel(key)}
                  {key.includes("year") && (
                    <span className="vrs-period-pill">Save 20%</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {error && <p className="vrs-error">{error}</p>}

      <div className={`vrs-pricing-plans ${classNames.plans ?? ""}`.trim()}>
        {products.map((product) => {
          const price = priceFor(product, period);
          if (!price) return null;

          const isHighlighted =
            highlightedId === product.id ||
            Boolean((product as unknown as Record<string, unknown>).highlighted);

          return (
            <section
              key={product.id}
              className={`vrs-plan ${
                isHighlighted ? "vrs-plan-highlighted" : ""
              } ${classNames.card ?? ""} ${
                isHighlighted ? classNames.highlightedCard ?? "" : ""
              }`.trim()}
            >
              {isHighlighted && (
                <div className={`vrs-plan-badge ${classNames.badge ?? ""}`.trim()}>
                  {highlightedBadge}
                </div>
              )}

              <div className="vrs-plan-header">
                {product.images[0] && (
                  <img className="vrs-plan-image" src={product.images[0]} alt="" />
                )}
                <h3 className={`vrs-plan-name ${classNames.name ?? ""}`.trim()}>
                  {product.name}
                </h3>
                {product.description && (
                  <p className={`vrs-plan-description ${classNames.description ?? ""}`.trim()}>
                    {product.description}
                  </p>
                )}
              </div>

              <div className={`vrs-plan-price-wrap ${classNames.priceWrap ?? ""}`.trim()}>
                <span className={`vrs-plan-price ${classNames.price ?? ""}`.trim()}>
                  {formatPrice(price, currency)}
                </span>
                {price.interval !== "one_time" && (
                  <span className={`vrs-plan-interval ${classNames.periodLabel ?? ""}`.trim()}>
                    / {price.interval}
                  </span>
                )}
              </div>

              {product.trial_days > 0 && price.interval !== "one_time" && (
                <p className={`vrs-plan-trial ${classNames.trial ?? ""}`.trim()}>
                  {`${product.trial_days}-day free trial`}
                </p>
              )}

              {product.marketing_features.length > 0 && (
                <div className="vrs-plan-features-wrap">
                  <span className="vrs-plan-features-label">Included:</span>
                  <ul className={`vrs-plan-features ${classNames.features ?? ""}`.trim()}>
                    {product.marketing_features.map((f) => (
                      <li
                        key={f.name}
                        className={`vrs-plan-feature-item ${classNames.featureItem ?? ""}`.trim()}
                      >
                        <CheckIcon className={classNames.featureIcon} />
                        <span>{f.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="vrs-plan-cta">
                {renderCta ? (
                  renderCta({
                    price,
                    product,
                    busy: busyPrice === price.id,
                    onChoose: () => props.onChoose(price, product),
                  })
                ) : (
                  <button
                    type="button"
                    className={`vrs-button ${
                      isHighlighted ? "vrs-button-highlighted" : "vrs-button-primary"
                    } ${classNames.button ?? ""} ${
                      isHighlighted ? classNames.buttonHighlighted ?? "" : ""
                    }`.trim()}
                    disabled={busyPrice === price.id}
                    onClick={() => props.onChoose(price, product)}
                  >
                    {busyPrice === price.id
                      ? "Starting..."
                      : price.interval === "one_time"
                        ? "Buy now"
                        : "Start free trial"}
                  </button>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
