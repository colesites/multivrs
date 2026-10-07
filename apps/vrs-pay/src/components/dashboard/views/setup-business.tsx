import { type FormEvent, useState } from "react";
import type { AccountSetup, BusinessType } from "../types";
import { Input, NativeSelect } from "../ui";
import { registrationHint } from "./registration-hints";
import { Field, SectionCard, value } from "./section-form";
import { FormFooter, useSetupSave } from "./setup-forms";
import { isDone } from "./setup-sections";

const BUSINESS_TYPES: Array<{ id: BusinessType; label: string }> = [
  {
    id: "company",
    label: "Registered business (company, partnership or business name)",
  },
  { id: "individual", label: "Not registered (individual or sole trader)" },
];

interface SectionProps {
  setup: AccountSetup;
  onSaved: (setup: AccountSetup) => void;
}

/** Registered or not decides what we ask: legal name and number, or just a trading name. */
function BusinessForm({ setup, onSaved }: SectionProps) {
  const saved = setup.details.business;
  const [type, setType] = useState<BusinessType | "">(saved.type ?? "");
  const { save, pending, error } = useSetupSave(onSaved);
  const company = type === "company";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    void save("/setup", {
      business: {
        type,
        name: value(f, "name"),
        ...(company
          ? { registration_number: value(f, "registration_number") }
          : {}),
        address: {
          line1: value(f, "line1"),
          line2: value(f, "line2"),
          city: value(f, "city"),
          postal_code: value(f, "postal_code"),
        },
        phone: value(f, "phone"),
      },
    });
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <Field label="Is your business registered?">
        <NativeSelect
          value={type}
          onChange={(e) =>
            setType(
              BUSINESS_TYPES.find((t) => t.id === e.target.value)?.id ?? "",
            )
          }
          required
        >
          <option value="" disabled>
            Choose one
          </option>
          {BUSINESS_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </NativeSelect>
      </Field>
      {type && (
        <div className="grid gap-4 sm:grid-cols-2">
          {company ? (
            <>
              <Field label="Legal business name" hint="As registered.">
                <Input name="name" required defaultValue={saved.name ?? ""} />
              </Field>
              <Field
                label="Registration number"
                hint={registrationHint(setup.details.identity.country)}
              >
                <Input
                  name="registration_number"
                  required
                  defaultValue={saved.registration_number ?? ""}
                />
              </Field>
            </>
          ) : (
            <div className="sm:col-span-2">
              <Field
                label="Trading name (optional)"
                hint="The name customers know you by. Leave blank to use your own name."
              >
                <Input name="name" defaultValue={saved.name ?? ""} />
              </Field>
            </div>
          )}
          <Field label={company ? "Registered address" : "Your address"}>
            <Input
              name="line1"
              required
              defaultValue={saved.address.line1 ?? ""}
            />
          </Field>
          <Field label="Address line 2 (optional)">
            <Input name="line2" defaultValue={saved.address.line2 ?? ""} />
          </Field>
          <Field label="City">
            <Input
              name="city"
              required
              defaultValue={saved.address.city ?? ""}
            />
          </Field>
          <Field label="Postal code (optional)">
            <Input
              name="postal_code"
              defaultValue={saved.address.postal_code ?? ""}
            />
          </Field>
          <Field label="Phone" hint="With country code, e.g. +234 803 123 4567">
            <Input
              name="phone"
              type="tel"
              required
              defaultValue={saved.phone ?? ""}
            />
          </Field>
        </div>
      )}
      <FormFooter pending={pending} error={error} />
    </form>
  );
}

export function BusinessSection({ setup, onSaved }: SectionProps) {
  return (
    <SectionCard
      title="Business details"
      description="Registered or not, so we know what to ask, then where to reach you."
      done={isDone(setup, "business")}
    >
      <BusinessForm setup={setup} onSaved={onSaved} />
    </SectionCard>
  );
}
