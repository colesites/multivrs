import type { PersonDetails } from "./identity.types";

export const NAME_MISMATCH =
  "The name on this ID doesn't match. Enter your first and last name exactly as they appear on it.";
export const DOB_MISMATCH = "The date of birth on this ID doesn't match the one you entered.";

/** Lowercase letters only, accents and apostrophes dropped: "Adébáyọ̀ O'Neil" → adebayo, oneil. */
export function nameTokens(name: string): string[] {
  return name
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/['’.]/g, "")
    .split(/[^\p{L}]+/u)
    .filter(Boolean);
}

/**
 * Every part of the first and last name the merchant typed appears in the
 * names on record, in any order. Registries often list surname first or
 * add middle names, so extra names on record are fine; missing ones aren't.
 */
export function namesMatch(onRecord: ReadonlyArray<string | null>, person: PersonDetails): boolean {
  const recorded = new Set(onRecord.flatMap((n) => (n ? nameTokens(n) : [])));
  const first = nameTokens(person.firstName);
  const last = nameTokens(person.lastName);
  if (first.length === 0 || last.length === 0) return false;
  return [...first, ...last].every((token) => recorded.has(token));
}

/** "1990-04-12" from a date on record that starts with YYYY-MM-DD, otherwise null. */
export function isoDate(value: string | null | undefined): string | null {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : null;
}
