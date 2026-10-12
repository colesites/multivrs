// Rendered inside the BillingShowcase island, so no "use client" here: a
// nested island makes the server wrap it in markup the showcase doesn't render.
import React from "react";
import type { PricingPrice, PricingProduct } from "./types";
import { type VrsAppearance, appearanceToStyle } from "./appearance";
import { type PeriodKey, formatPrice, priceFor } from "./price-choice";

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
  tagline?: string;
  description?: string;
  priceWrap?: string;
  price?: string;
  interval?: string;
  subtext?: string;
  trial?: string;
  highlightsLabel?: string;
  features?: string;
  featureItem?: string;
  featureIcon?: string;
  button?: string;
  buttonHighlighted?: string;
}

export interface PricingTableViewProps {
  products: PricingProduct[];
  periods?: PeriodKey[];
  period?: PeriodKey | null;
  onPeriodChange?: (period: PeriodKey) => void;
  onChoose: (price: PricingPrice, product: PricingProduct) => void;
  currency?: string;
  highlightedId?: string | null;
  highlightedBadge?: string;
  busyPrice?: string | null;
  error?: string | null;
  className?: string;
  appearance?: VrsAppearance;
  classNames?: PricingTableClassNames;
  audience?: "personal" | "professional";
  onAudienceChange?: (audience: "personal" | "professional") => void;
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
      className={`size-3.5 shrink-0 ${className ?? "text-[#6936f5]"}`.trim()}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.6}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function PricingTableView({
  products,
  periods = ["month:1", "year:1"],
  period = "month:1",
  onPeriodChange,
  onChoose,
  currency,
  highlightedId = "pro",
  highlightedBadge = "MOST POPULAR",
  busyPrice,
  error,
  className,
  appearance,
  classNames = {},
  renderCta,
}: PricingTableViewProps) {
  const customStyle = appearanceToStyle(appearance);
  const themeAttr = appearance?.theme;
  const isYearly = period === "year:1";

  return (
    <div
      className={`vrs-pricing w-full ${className ?? ""} ${classNames.wrapper ?? ""}`.trim()}
      style={customStyle}
      data-vrs-theme={themeAttr}
    >
      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-600 font-medium">
          {error}
        </div>
      )}

      {/* Top Cadence Controls (Kontinue-style pill switch) */}
      {onPeriodChange && periods.length > 1 && (
        <div className={`mb-10 flex flex-wrap items-center justify-center gap-6 ${classNames.periods ?? ""}`.trim()}>
          <div className="inline-flex items-center gap-2.5">
            <span
              onClick={() => onPeriodChange("month:1")}
              className={`cursor-pointer text-xs font-semibold transition-colors ${
                !isYearly ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-600"
              }`}
            >
              Monthly
            </span>

            {/* Toggle switch */}
            <button
              type="button"
              role="switch"
              aria-checked={isYearly}
              onClick={() => onPeriodChange(isYearly ? "month:1" : "year:1")}
              className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-neutral-200 transition-colors duration-200 ease-in-out focus:outline-hidden"
              style={{
                backgroundColor: isYearly ? "var(--vrs-accent, #6936f5)" : undefined,
              }}
            >
              <span
                className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  isYearly ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>

            <span
              onClick={() => onPeriodChange("year:1")}
              className={`cursor-pointer text-xs font-semibold transition-colors ${
                isYearly ? "text-neutral-900" : "text-neutral-400 hover:text-neutral-600"
              }`}
            >
              Annual
            </span>

            <span
              className="rounded-full px-2 py-0.5 text-[9.5px] font-bold tracking-wider uppercase text-[#6936f5] bg-[#6936f5]/10"
              style={{ color: "var(--vrs-accent, #6936f5)" }}
            >
              SAVE 20% WITH ANNUAL
            </span>
          </div>
        </div>
      )}

      {/* 3-Column Plan Cards Grid */}
      <div className={`grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-7 items-stretch ${classNames.plans ?? ""}`.trim()}>
        {products.map((product) => {
          const price = priceFor(product, period, currency);
          const isHighlighted =
            highlightedId !== undefined
              ? highlightedId === product.id
              : Boolean(product.features?.highlighted);
          const busy = price ? busyPrice === price.id : false;

          // Persona tagline from product or defaults
          const tagline =
            (product.features?.tagline as string) ||
            (product.id === "starter"
              ? "Best for trying VRS Pay"
              : product.id === "pro"
                ? "Best for regular SaaS billing"
                : "Best for high-volume platforms");

          const subtext =
            price?.amount === 0
              ? "No payment required"
              : isYearly
                ? "Billed annually"
                : "Billed monthly";

          return (
            <article
              key={product.id}
              className={`relative flex flex-col justify-between rounded-[28px] bg-white p-7 sm:p-8 transition-all duration-300 ${
                isHighlighted
                  ? "border-2 shadow-[0_16px_40px_-16px_rgba(105,54,245,0.18)]"
                  : "border border-neutral-200/80 shadow-[0_4px_24px_-6px_rgba(0,0,0,0.04)] hover:shadow-lg hover:border-neutral-300"
              } ${classNames.card ?? ""} ${isHighlighted ? (classNames.highlightedCard ?? "") : ""}`.trim()}
              style={{
                borderColor: isHighlighted ? "var(--vrs-accent, #6936f5)" : undefined,
              }}
            >
              <div>
                {/* Popular badge */}
                {isHighlighted && (
                  <div className="mb-4">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-[10px] font-bold tracking-wider uppercase text-white shadow-xs ${
                        classNames.badge ?? ""
                      }`.trim()}
                      style={{ backgroundColor: "var(--vrs-accent, #6936f5)" }}
                    >
                      {highlightedBadge}
                    </span>
                  </div>
                )}

                {/* Plan Name */}
                <h3
                  className={`text-xl font-bold tracking-tight text-neutral-900 ${classNames.name ?? ""}`.trim()}
                >
                  {product.name}
                </h3>

                {/* Subtitle / Persona */}
                <p
                  className={`mt-2 text-xs font-semibold text-neutral-900 ${classNames.tagline ?? ""}`.trim()}
                >
                  {tagline}
                </p>

                {/* One sentence description */}
                {product.description && (
                  <p
                    className={`mt-1 text-xs leading-relaxed text-neutral-500 min-h-[34px] ${
                      classNames.description ?? ""
                    }`.trim()}
                  >
                    {product.description}
                  </p>
                )}

                {/* Price Display */}
                {price && (
                  <div className={`mt-5 ${classNames.priceWrap ?? ""}`.trim()}>
                    <div className="flex items-baseline gap-1">
                      <span
                        className={`text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 ${
                          classNames.price ?? ""
                        }`.trim()}
                      >
                        {price.amount === 0 ? "$0" : `$${(price.amount / 100).toFixed(price.amount % 100 === 0 ? 0 : 2)}`}
                      </span>
                      <span
                        className={`text-xs text-neutral-500 font-normal ${classNames.interval ?? ""}`.trim()}
                      >
                        {price.amount === 0 ? "forever" : `/ ${price.interval}`}
                      </span>
                    </div>
                    <p
                      className={`mt-1 text-[11px] text-neutral-400 font-normal ${classNames.subtext ?? ""}`.trim()}
                    >
                      {subtext}
                    </p>
                  </div>
                )}

                {/* CTA Button (Pill shape) */}
                <div className="mt-6">
                  {price &&
                    (renderCta ? (
                      renderCta({
                        price,
                        product,
                        busy,
                        onChoose: () => onChoose(price, product),
                      })
                    ) : (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => onChoose(price, product)}
                        className={`w-full rounded-full py-2.5 px-5 text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
                          isHighlighted
                            ? "text-white shadow-sm hover:shadow-md hover:brightness-105"
                            : "border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50 hover:border-neutral-400"
                        } ${classNames.button ?? ""} ${
                          isHighlighted ? (classNames.buttonHighlighted ?? "") : ""
                        }`.trim()}
                        style={{
                          backgroundColor: isHighlighted ? "var(--vrs-accent, #6936f5)" : undefined,
                        }}
                      >
                        {busy
                          ? "Processing..."
                          : price.amount === 0
                            ? "Start free"
                            : `Get ${product.name}`}
                      </button>
                    ))}
                </div>

                {/* Plan Highlights Divider & List */}
                {product.marketing_features.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-neutral-100">
                    <p
                      className={`text-[10px] font-bold tracking-widest uppercase text-neutral-400 mb-4 ${
                        classNames.highlightsLabel ?? ""
                      }`.trim()}
                    >
                      PLAN HIGHLIGHTS
                    </p>
                    <ul className={`space-y-3 ${classNames.features ?? ""}`.trim()}>
                      {product.marketing_features.map((feat, i) => (
                        <li
                          key={i}
                          className={`flex items-start gap-2.5 text-xs text-neutral-600 leading-normal ${
                            classNames.featureItem ?? ""
                          }`.trim()}
                        >
                          <CheckIcon className={classNames.featureIcon} />
                          <span>{feat.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
