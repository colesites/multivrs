"use client";

import { getCountries } from "libphonenumber-js";

export interface DomainBillingState {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  country: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
}

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
const countries = getCountries()
  .map((code) => ({ code, name: regionNames.of(code) ?? code }))
  .sort((left, right) => left.name.localeCompare(right.name));

export function DomainBillingFields({
  value,
  onChange,
}: {
  value: DomainBillingState;
  onChange: (next: DomainBillingState) => void;
}) {
  function update(field: keyof DomainBillingState, next: string) {
    onChange({ ...value, [field]: next });
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <BillingField
          label="First name"
          value={value.firstName}
          onChange={(next) => update("firstName", next)}
          autoComplete="given-name"
        />
        <BillingField
          label="Last name"
          value={value.lastName}
          onChange={(next) => update("lastName", next)}
          autoComplete="family-name"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <BillingField
          type="email"
          label="Email"
          value={value.email}
          onChange={(next) => update("email", next)}
          autoComplete="email"
        />
        <BillingField
          label="Company"
          value={value.company}
          onChange={(next) => update("company", next)}
          autoComplete="organization"
          optional
        />
      </div>
      <label className="grid gap-2 text-sm text-white/55">
        Country or region
        <select
          required
          value={value.country}
          onChange={(event) => update("country", event.target.value)}
          autoComplete="country"
          className={inputClass}
        >
          <option value="" disabled>
            Select your country
          </option>
          {countries.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>
      </label>
      <BillingField
        label="Billing address"
        value={value.line1}
        onChange={(next) => update("line1", next)}
        autoComplete="address-line1"
        placeholder="Street address"
      />
      <BillingField
        label="Address 2"
        value={value.line2}
        onChange={(next) => update("line2", next)}
        autoComplete="address-line2"
        optional
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <BillingField
          label="City"
          value={value.city}
          onChange={(next) => update("city", next)}
          autoComplete="address-level2"
        />
        <BillingField
          label="State / Province / Region"
          value={value.state}
          onChange={(next) => update("state", next)}
          autoComplete="address-level1"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <BillingField
          label="ZIP / Postal code"
          value={value.postalCode}
          onChange={(next) => update("postalCode", next)}
          autoComplete="postal-code"
        />
        <BillingField
          type="tel"
          label="Phone"
          value={value.phone}
          onChange={(next) => update("phone", next)}
          autoComplete="tel"
          placeholder="+234 800 000 0000"
        />
      </div>
    </div>
  );
}

function BillingField({
  label,
  optional,
  onChange,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> & {
  label: string;
  optional?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm text-white/55">
      <span>
        {label}
        {optional ? <span className="text-white/30"> (optional)</span> : null}
      </span>
      <input
        {...props}
        required={!optional}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      />
    </label>
  );
}

const inputClass =
  "h-11 w-full rounded-md border border-white/12 bg-[#0b0b0b] px-3 text-sm text-white outline-hidden transition placeholder:text-white/25 focus:border-white/35 focus:ring-2 focus:ring-white/5";
