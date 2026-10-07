/** What the company registration number is called where the business is based. */
const HINTS: Record<string, string> = {
  NG: "Your CAC number, e.g. RC 1234567 or BN 1234567",
  GH: "Your Registrar-General number, e.g. CS123456789",
  KE: "Your Business Registration Service number, e.g. PVT-AB1CD2E",
  ZA: "Your CIPC number, e.g. 2015/123456/07",
  GB: "Your Companies House number, e.g. 01234567",
  US: "Your EIN, 9 digits",
};

export function registrationHint(country: string | null): string {
  return (
    (country && HINTS[country]) || "As shown on your registration certificate"
  );
}
