/**
 * @vrs-pay/react — what the pricing table and customer portal show, and
 * how a table picks its billing periods. Rendered to HTML on the server.
 */
import { describe, expect, test } from "bun:test";
import type { CustomerOverview, CustomerSubscription, PricingProduct } from "@vrs-pay/js";
import { renderToString } from "react-dom/server";
import {
  CustomerPortalView,
  Gate,
  PricingTableView,
  periodLabel,
  periodsOf,
  priceFor,
  useVrsPay,
  VrsPayProvider,
} from "../src/index";

const price = (id: string, interval: string, amount: number, count = 1) => ({
  id,
  amount,
  currency: "gbp",
  currency_options: {},
  interval: interval as "month",
  interval_count: count,
  usage_type: "licensed" as const,
  lookup_key: null,
});

const PRO: PricingProduct = {
  id: "prod_pro",
  object: "product",
  name: "Pro",
  description: "For growing teams",
  images: [],
  marketing_features: [{ name: "Custom domains" }, { name: "5 seats" }],
  trial_days: 14,
  features: { custom_domains: true },
  prices: [price("price_m", "month", 900), price("price_y", "year", 9000)],
};

const BOOK: PricingProduct = {
  ...PRO,
  id: "prod_book",
  name: "Ebook",
  description: null,
  trial_days: 0,
  marketing_features: [],
  prices: [price("price_once", "one_time", 1500)],
};

const noop = () => {};

describe("billing periods", () => {
  test("monthly comes first; one-time prices show under every period", () => {
    expect(periodsOf([PRO, BOOK])).toEqual(["month:1", "year:1"]);
    expect(priceFor(PRO, "year:1")?.id).toBe("price_y");
    expect(priceFor(BOOK, "month:1")?.id).toBe("price_once");
    expect(periodLabel("month:3")).toBe("Quarterly");
    expect(periodLabel("week:2")).toBe("Every 2 weeks");
  });
});

describe("PricingTableView", () => {
  const html = (period: string) =>
    renderToString(
      <PricingTableView
        products={[PRO, BOOK]}
        periods={periodsOf([PRO, BOOK])}
        period={period}
        onPeriodChange={noop}
        onChoose={noop}
      />,
    );

  test("shows each plan's price for the chosen period, its trial and features", () => {
    const monthly = html("month:1");
    expect(monthly).toContain("£9.00 / month");
    expect(monthly).toContain("14-day free trial");
    expect(monthly).toContain("Custom domains");
    expect(monthly).toContain(">Subscribe<");
    expect(monthly).toContain("£15.00");
    expect(monthly).toContain(">Buy<");
    expect(html("year:1")).toContain("£90.00 / year");
  });

  test("offers a period switch only when there's a choice", () => {
    expect(html("month:1")).toContain('aria-selected="true"');
    const single = renderToString(
      <PricingTableView
        products={[BOOK]}
        periods={[]}
        period={null}
        onPeriodChange={noop}
        onChoose={noop}
      />,
    );
    expect(single).not.toContain("vrs-pricing-periods");
  });
});

describe("CustomerPortalView", () => {
  const NOV_7 = Date.UTC(2026, 10, 7, 12) / 1000;
  const sub: CustomerSubscription = {
    id: "sub_1",
    status: "active",
    plan: "plan_pro",
    price: "price_m",
    product_name: "Pro",
    price_details: price("price_m", "month", 900),
    quantity: 1,
    currency: "gbp",
    current_period_end: NOV_7,
    trial_end: null,
    cancel_at_period_end: false,
    pending_price: null,
  };
  const overview = (subscriptions: CustomerSubscription[]): CustomerOverview => ({
    object: "customer_overview",
    customer: { id: "cus_1", email: "ada@shop.test", name: "Ada" },
    subscriptions,
    invoices: [
      {
        id: "inv_1",
        status: "paid",
        currency: "gbp",
        total: 900,
        period_start: NOV_7,
        period_end: NOV_7,
        paid_at: NOV_7,
        created: NOV_7,
      },
    ],
    entitlements: { object: "entitlements", customer: "cus_1", plans: ["pro"], features: {} },
  });
  const html = (subscriptions: CustomerSubscription[]) =>
    renderToString(
      <CustomerPortalView
        overview={overview(subscriptions)}
        onCancel={noop}
        onResume={noop}
        locale="en-GB"
      />,
    );

  test("shows the plan, its price, when it renews and the invoices", () => {
    const page = html([sub]);
    expect(page).toContain("Pro");
    expect(page).toContain("£9.00 / month");
    expect(page).toContain("Renews 7 Nov 2026");
    expect(page).toContain("Cancel plan");
    expect(page).toContain("£9.00</span>");
  });

  test("a plan ending at period end can be kept; a trial shows its end", () => {
    const ending = html([{ ...sub, cancel_at_period_end: true }]);
    expect(ending).toContain("Ends 7 Nov 2026");
    expect(ending).toContain("Keep plan");
    const trial = html([{ ...sub, status: "trialing", trial_end: NOV_7 }]);
    expect(trial).toContain("Trial ends 7 Nov 2026");
  });

  test("canceled plans are hidden", () => {
    const page = html([{ ...sub, status: "canceled" }]);
    expect(page).toContain("have a subscription");
    expect(page).not.toContain("Cancel plan");
  });
});

describe("provider", () => {
  test("components need a VrsPayProvider", () => {
    function Probe() {
      useVrsPay();
      return null;
    }
    expect(() => renderToString(<Probe />)).toThrow(/VrsPayProvider/);
  });

  test("a gate shows its loading state until entitlements arrive", () => {
    const page = renderToString(
      <VrsPayProvider publishableKey="pk_test_x" apiUrl="http://vrs.test">
        <Gate feature="exports" loading={<span>checking</span>} fallback={<span>upgrade</span>}>
          <span>export</span>
        </Gate>
      </VrsPayProvider>,
    );
    expect(page).toContain("checking");
    expect(page).not.toContain("export<");
  });
});
