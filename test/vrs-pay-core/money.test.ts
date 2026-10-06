/**
 * @vrs-pay/core money — integer minor units, exact decimal parsing.
 */
import { describe, expect, test } from "bun:test";
import {
  addMoney,
  CurrencyCodeSchema,
  money,
  moneyFromDecimal,
  moneyToDecimal,
  subtractMoney,
} from "@vrs-pay/core";
import { thrown } from "./helpers";

describe("money", () => {
  test("parses decimal strings exactly into minor units", () => {
    expect(moneyFromDecimal("49.99", "GBP")).toEqual({ amount: 4999, currency: "GBP" });
    expect(moneyFromDecimal("15000", "NGN")).toEqual({ amount: 1500000, currency: "NGN" });
    expect(moneyFromDecimal("1000", "JPY")).toEqual({ amount: 1000, currency: "JPY" });
    expect(moneyFromDecimal("-0.5", "USD")).toEqual({ amount: -50, currency: "USD" });
  });

  test("rejects extra precision instead of rounding", () => {
    expect(thrown(() => moneyFromDecimal("49.999", "GBP")).code).toBe("amount_invalid");
    expect(thrown(() => moneyFromDecimal("1.5", "JPY")).code).toBe("amount_invalid");
    expect(thrown(() => moneyFromDecimal("12,00", "EUR")).code).toBe("amount_invalid");
  });

  test("formats back to an exact decimal string", () => {
    expect(moneyToDecimal(money(5, "GBP"))).toBe("0.05");
    expect(moneyToDecimal(money(-4999, "GBP"))).toBe("-49.99");
    expect(moneyToDecimal(money(1000, "JPY"))).toBe("1000");
  });

  test("only whole minor units and same-currency arithmetic", () => {
    expect(thrown(() => money(1.5, "GBP")).param).toBe("amount");
    expect(addMoney(money(100, "EUR"), money(250, "EUR")).amount).toBe(350);
    expect(subtractMoney(money(100, "EUR"), money(250, "EUR")).amount).toBe(-150);
    expect(thrown(() => addMoney(money(1, "GBP"), money(1, "NGN"))).code).toBe("currency_mismatch");
  });

  test("currency codes are case-insensitive and validated", () => {
    expect(CurrencyCodeSchema.parse("ngn")).toBe("NGN");
    expect(CurrencyCodeSchema.safeParse("XYZ").success).toBe(false);
  });
});

describe("platform fees", () => {
  test("basis points round down and never exceed the amount", async () => {
    const { calculatePlatformFee } = await import("@vrs-pay/core");
    expect(calculatePlatformFee(money(10000, "GBP"), 150).amount).toBe(150);
    expect(calculatePlatformFee(money(999, "GBP"), 150).amount).toBe(14);
    expect(calculatePlatformFee(money(10000, "NGN"), 150, money(5000, "NGN")).amount).toBe(5150);
    expect(calculatePlatformFee(money(100, "USD"), 0, money(500, "USD")).amount).toBe(100);
    expect(thrown(() => calculatePlatformFee(money(100, "USD"), 1.5)).code).toBe(
      "fee_rate_invalid",
    );
  });
});
