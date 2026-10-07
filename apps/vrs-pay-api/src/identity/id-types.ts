/** An official ID a merchant can verify with, and what its number looks like. */
export interface IdType {
  id: string;
  label: string;
  pattern: RegExp;
  hint: string;
}

const PASSPORT: IdType = {
  id: "passport",
  label: "Passport",
  pattern: /^[A-Z0-9]{6,12}$/,
  hint: "6–12 letters and digits",
};
const NATIONAL_ID: IdType = {
  id: "national_id",
  label: "National ID card",
  pattern: /^[A-Z0-9-]{5,20}$/,
  hint: "As printed on the card",
};

/** Official IDs by business location; everywhere else uses a passport or national ID. */
const BY_COUNTRY: Record<string, IdType[]> = {
  NG: [
    {
      id: "bvn",
      label: "BVN (Bank Verification Number)",
      pattern: /^\d{11}$/,
      hint: "11 digits — dial *565*0# to get yours",
    },
    {
      id: "nin",
      label: "NIN (National Identification Number)",
      pattern: /^\d{11}$/,
      hint: "11 digits, on your NIN slip or NIMC app",
    },
  ],
  GH: [
    {
      id: "ghana_card",
      label: "Ghana Card",
      pattern: /^GHA-\d{9}-\d$/,
      hint: "e.g. GHA-123456789-0",
    },
    PASSPORT,
  ],
  KE: [
    { id: "national_id", label: "Kenyan National ID", pattern: /^\d{7,8}$/, hint: "7–8 digits" },
    PASSPORT,
  ],
  ZA: [
    { id: "national_id", label: "South African ID number", pattern: /^\d{13}$/, hint: "13 digits" },
    PASSPORT,
  ],
  US: [
    { id: "ssn", label: "SSN or ITIN", pattern: /^\d{9}$/, hint: "9 digits, no dashes" },
    PASSPORT,
  ],
  GB: [
    PASSPORT,
    {
      id: "driving_licence",
      label: "UK driving licence",
      pattern: /^[A-Z9]{5}\d{6}[A-Z9]{2}\d[A-Z]{2}$/,
      hint: "16 characters",
    },
  ],
};

export function idTypesFor(country: string): IdType[] {
  return BY_COUNTRY[country] ?? [PASSPORT, NATIONAL_ID];
}

/** The ID type if it's accepted in `country`. */
export function findIdType(country: string, id: string): IdType | undefined {
  return idTypesFor(country).find((t) => t.id === id);
}

/** Uppercase, without spaces, so "gha 123…" and "GHA123…" check the same. */
export function normalizeIdNumber(value: string): string {
  return value.replace(/\s+/g, "").toUpperCase();
}
