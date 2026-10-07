import { type FormEvent, useState } from "react";
import { useDashboard } from "../context";
import { countryOptions } from "../countries";
import type { AccountSetup } from "../types";
import { Input, NativeSelect } from "../ui";
import { Field } from "./section-form";
import { FormFooter, useSetupSave } from "./setup-forms";
import { useIdTypes } from "./use-id-types";

const STATUS_NOTE: Record<string, string> = {
  verified: "Verified.",
  pending: "We're checking your ID — usually within 1 business day.",
};

/** Business location first; the official IDs we accept follow from it. */
export function IdentityForm({
  setup,
  onSaved,
}: {
  setup: AccountSetup;
  onSaved: (s: AccountSetup) => void;
}) {
  const { session } = useDashboard();
  const identity = setup.details.identity;
  const [country, setCountry] = useState(identity.country ?? "");
  const { idTypes, idType, setIdType } = useIdTypes(
    country,
    identity.id_type ?? "",
  );
  const { save, pending, error } = useSetupSave(onSaved);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    const get = (name: string) => String(f.get(name) ?? "").trim();
    void save("/setup/identity", {
      country,
      id_type: idType,
      id_number: get("id_number"),
      first_name: get("first_name"),
      last_name: get("last_name"),
      date_of_birth: get("date_of_birth"),
    });
  }

  const hint = idTypes.find((t) => t.id === idType)?.hint;
  const note =
    identity.status === "failed"
      ? identity.reason
      : STATUS_NOTE[identity.status];
  return (
    <form onSubmit={submit} className="grid gap-4">
      {note && (
        <p
          className={`text-sm ${identity.status === "failed" ? "text-red-700" : "text-ink-soft"}`}
        >
          {note}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Business location">
          <NativeSelect
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
          >
            <option value="" disabled>
              Choose a country
            </option>
            {countryOptions().map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field label="Official ID">
          <NativeSelect
            value={idType}
            onChange={(e) => setIdType(e.target.value)}
            required
            disabled={!country}
          >
            {idTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field label="ID number" hint={hint}>
          <Input
            name="id_number"
            required
            autoComplete="off"
            placeholder={identity.last4 ? `••••${identity.last4}` : ""}
          />
        </Field>
        <Field label="Date of birth">
          <Input
            name="date_of_birth"
            type="date"
            required
            defaultValue={identity.date_of_birth ?? ""}
          />
        </Field>
        <Field label="First name" hint="As on your ID.">
          <Input
            name="first_name"
            required
            defaultValue={identity.first_name ?? ""}
          />
        </Field>
        <Field label="Last name">
          <Input
            name="last_name"
            required
            defaultValue={identity.last_name ?? ""}
          />
        </Field>
      </div>
      {session.mode === "test" && (
        <p className="text-xs text-mute">
          Test mode: any correctly formatted number passes; 00000000000 always
          fails.
        </p>
      )}
      <FormFooter pending={pending} error={error} label="Verify" />
    </form>
  );
}
