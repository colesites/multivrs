import type { FormEvent } from "react";
import type { AccountSetup } from "../types";
import { Input, NativeSelect } from "../ui";
import { Field } from "./section-form";
import { FormFooter, useSetupSave } from "./setup-forms";

const PAYOUT_CURRENCIES = [
  "NGN",
  "GHS",
  "KES",
  "ZAR",
  "USD",
  "GBP",
  "EUR",
  "CAD",
  "AUD",
];

export function PayoutForm({
  setup,
  onSaved,
}: {
  setup: AccountSetup;
  onSaved: (s: AccountSetup) => void;
}) {
  const { save, pending, error } = useSetupSave(onSaved);
  const saved = setup.details.payout;
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    const get = (name: string) => String(f.get(name) ?? "").trim();
    void save("/setup", {
      payout: {
        currency: get("currency"),
        account_name: get("account_name"),
        bank_name: get("bank_name"),
        account_number: get("account_number"),
        ...(get("bank_code") ? { bank_code: get("bank_code") } : {}),
      },
    });
  }
  return (
    <form onSubmit={submit} className="grid gap-4">
      <p className="text-sm text-mute">
        {saved
          ? `Connected: ${saved.bank_name} account ending ${saved.last4} (${saved.currency}). Enter new details to replace it.`
          : "Encrypted when saved — we only ever show the last 4 digits."}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Payout currency">
          <NativeSelect name="currency" defaultValue={saved?.currency ?? "NGN"}>
            {PAYOUT_CURRENCIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </NativeSelect>
        </Field>
        <Field label="Account holder name">
          <Input
            name="account_name"
            defaultValue={saved?.account_name ?? ""}
            required
          />
        </Field>
        <Field label="Bank name">
          <Input
            name="bank_name"
            defaultValue={saved?.bank_name ?? ""}
            required
            placeholder="e.g. GTBank, Barclays"
          />
        </Field>
        <Field label="Account number or IBAN">
          <Input name="account_number" required autoComplete="off" />
        </Field>
        <Field
          label="Bank code, sort code or SWIFT"
          hint="Optional if your bank doesn't use one."
        >
          <Input name="bank_code" autoComplete="off" />
        </Field>
      </div>
      <FormFooter
        pending={pending}
        error={error}
        label={saved ? "Replace account" : "Connect account"}
      />
    </form>
  );
}
