import { type FormEvent, useState } from "react";
import { useAction, useApi } from "../context";
import type { AccountSetup, List } from "../types";
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

interface Bank {
  name: string;
  code: string;
}

/**
 * A Nigerian account: pick the bank from Paystack's list, type the 10-digit
 * number, and the bank tells us the holder's name before it's saved.
 */
function NairaAccountFields() {
  const { data: banks, error } = useApi<List<Bank>>("/payouts/banks");
  const { run, pending } = useAction();
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [holder, setHolder] = useState<{
    name?: string;
    error?: string;
  } | null>(null);
  const bankName = banks?.data.find((b) => b.code === bankCode)?.name ?? "";

  async function check(code: string, number: string) {
    setHolder(null);
    if (!code || !/^\d{10}$/.test(number)) return;
    const result = await run<{ account_name: string }>("/payouts/resolve", {
      body: { bank_code: code, account_number: number },
    });
    setHolder(
      result.error
        ? { error: result.error }
        : { name: result.data?.account_name },
    );
  }

  return (
    <>
      <Field label="Bank">
        <NativeSelect
          name="bank_code"
          required
          value={bankCode}
          onChange={(e) => {
            setBankCode(e.target.value);
            void check(e.target.value, accountNumber);
          }}
        >
          <option value="">
            {banks ? "Choose your bank" : "Loading banks…"}
          </option>
          {banks?.data.map((b) => (
            <option key={b.code} value={b.code}>
              {b.name}
            </option>
          ))}
        </NativeSelect>
        {error && (
          <span className="mt-1 block text-xs text-red-700">{error}</span>
        )}
      </Field>
      <input type="hidden" name="bank_name" value={bankName} />
      <Field label="Account number" hint="10 digits (NUBAN).">
        <Input
          name="account_number"
          required
          inputMode="numeric"
          maxLength={10}
          autoComplete="off"
          value={accountNumber}
          onChange={(e) => {
            const digits = e.target.value.replace(/\D/g, "");
            setAccountNumber(digits);
            void check(bankCode, digits);
          }}
        />
      </Field>
      <Field label="Account holder">
        <Input
          name="account_name"
          readOnly
          required
          value={holder?.name ?? ""}
          placeholder={
            pending
              ? "Checking with the bank…"
              : "Shown once the bank confirms it"
          }
        />
        {holder?.error && (
          <span className="mt-1 block text-xs text-red-700">
            {holder.error}
          </span>
        )}
      </Field>
    </>
  );
}

function OtherAccountFields({ accountName }: { accountName: string }) {
  return (
    <>
      <Field label="Account holder name">
        <Input name="account_name" defaultValue={accountName} required />
      </Field>
      <Field label="Bank name">
        <Input name="bank_name" required placeholder="e.g. Barclays, Chase" />
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
    </>
  );
}

export function PayoutForm({
  setup,
  onSaved,
}: {
  setup: AccountSetup;
  onSaved: (s: AccountSetup) => void;
}) {
  const { save, pending, error } = useSetupSave(onSaved);
  const saved = setup.details.payout;
  const [currency, setCurrency] = useState(saved?.currency ?? "NGN");
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
          <NativeSelect
            name="currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            {PAYOUT_CURRENCIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </NativeSelect>
        </Field>
        {currency === "NGN" ? (
          <NairaAccountFields />
        ) : (
          <OtherAccountFields accountName={saved?.account_name ?? ""} />
        )}
      </div>
      <FormFooter
        pending={pending}
        error={error}
        label={saved ? "Replace account" : "Connect account"}
      />
    </form>
  );
}
