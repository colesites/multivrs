import { useState } from "react";
import { Input, NativeSelect } from "../ui";
import { Field } from "./section-form";

type Unit = "day" | "week" | "month" | "year";

/** The presets in Stripe's billing period menu; "custom" asks for a count and unit. */
const PRESETS = [
  { id: "one_time", label: "One-time" },
  { id: "day:1", label: "Daily" },
  { id: "week:1", label: "Weekly" },
  { id: "month:1", label: "Monthly" },
  { id: "month:3", label: "Every 3 months" },
  { id: "month:6", label: "Every 6 months" },
  { id: "year:1", label: "Yearly" },
  { id: "custom", label: "Custom" },
];

const UNITS: Array<{ id: Unit; label: string }> = [
  { id: "day", label: "days" },
  { id: "week", label: "weeks" },
  { id: "month", label: "months" },
  { id: "year", label: "years" },
];

/** How often a price charges; `prefix` keeps several prices apart in one form. */
export function BillingPeriodField({ prefix = "" }: { prefix?: string }) {
  const [choice, setChoice] = useState("one_time");
  return (
    <Field label="Billing period">
      <NativeSelect
        name={`${prefix}period`}
        value={choice}
        onChange={(e) => setChoice(e.target.value)}
      >
        {PRESETS.map((p) => (
          <option key={p.id} value={p.id}>
            {p.label}
          </option>
        ))}
      </NativeSelect>
      {choice === "custom" && (
        <div className="flex items-center gap-2 text-sm text-ink-soft">
          Every
          <Input
            name={`${prefix}count`}
            type="number"
            min={1}
            max={1095}
            defaultValue={2}
            required
            className="w-20"
          />
          <NativeSelect name={`${prefix}unit`} defaultValue="month">
            {UNITS.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </NativeSelect>
        </div>
      )}
    </Field>
  );
}

/** The chosen period as the API's `interval` and `interval_count`. */
export function readBillingPeriod(fields: FormData, prefix = "") {
  const choice = String(fields.get(`${prefix}period`) ?? "one_time");
  if (choice === "one_time") return { interval: "one_time", interval_count: 1 };
  if (choice === "custom") {
    return {
      interval: String(fields.get(`${prefix}unit`) ?? "month"),
      interval_count: Number(fields.get(`${prefix}count`) ?? 1),
    };
  }
  const [interval = "month", count = "1"] = choice.split(":");
  return { interval, interval_count: Number(count) };
}
