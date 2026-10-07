import { formatPrice, type PricingPrice, type PricingProduct } from "@vrs-pay/js";
import { type PeriodKey, periodLabel, priceFor } from "./price-choice";

export interface PricingTableViewProps {
  products: PricingProduct[];
  periods: PeriodKey[];
  period: PeriodKey | null;
  onPeriodChange: (period: PeriodKey) => void;
  onChoose: (price: PricingPrice, product: PricingProduct) => void;
  currency?: string;
  /** The price whose checkout is opening. */
  busyPrice?: string | null;
  error?: string | null;
  className?: string;
}

/** The pricing table's markup, without data loading: style it with the `vrs-` classes. */
export function PricingTableView(props: PricingTableViewProps) {
  const { products, periods, period, currency, busyPrice, error } = props;
  return (
    <div className={`vrs-pricing ${props.className ?? ""}`.trim()}>
      {periods.length > 1 && (
        <div className="vrs-pricing-periods" role="tablist">
          {periods.map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={key === period}
              className="vrs-pricing-period"
              onClick={() => props.onPeriodChange(key)}
            >
              {periodLabel(key)}
            </button>
          ))}
        </div>
      )}
      {error && <p className="vrs-error">{error}</p>}
      <div className="vrs-pricing-plans">
        {products.map((product) => {
          const price = priceFor(product, period);
          if (!price) return null;
          return (
            <section key={product.id} className="vrs-plan">
              {product.images[0] && (
                <img className="vrs-plan-image" src={product.images[0]} alt="" />
              )}
              <h3 className="vrs-plan-name">{product.name}</h3>
              {product.description && <p className="vrs-plan-description">{product.description}</p>}
              <p className="vrs-plan-price">{formatPrice(price, currency)}</p>
              {product.trial_days > 0 && price.interval !== "one_time" && (
                <p className="vrs-plan-trial">{`${product.trial_days}-day free trial`}</p>
              )}
              {product.marketing_features.length > 0 && (
                <ul className="vrs-plan-features">
                  {product.marketing_features.map((f) => (
                    <li key={f.name}>{f.name}</li>
                  ))}
                </ul>
              )}
              <button
                type="button"
                className="vrs-button"
                disabled={busyPrice === price.id}
                onClick={() => props.onChoose(price, product)}
              >
                {price.interval === "one_time" ? "Buy" : "Subscribe"}
              </button>
            </section>
          );
        })}
      </div>
    </div>
  );
}
