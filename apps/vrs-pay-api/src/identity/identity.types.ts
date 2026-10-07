export interface IdentityCheck {
  /** Our merchant id, so the provider's records point back to the account. */
  merchantId: string;
  country: string;
  idType: string;
  idNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}

/** What the merchant typed, matched against the name and birth date on the ID. */
export type PersonDetails = Pick<IdentityCheck, "firstName" | "lastName" | "dateOfBirth">;

/** A check the merchant finishes on the provider's page (ID document and selfie). */
export interface IdentitySession {
  id: string;
  /** Short-lived link to the provider's page. Never stored; null once they've submitted. */
  url: string | null;
}

export type IdentityResult =
  | { status: "verified" }
  | { status: "failed"; reason: string }
  /** Waiting on the merchant (session.url) or on the provider's document review. */
  | { status: "pending"; reason: string; session: IdentitySession };

/** Checks an official ID against its issuer, or against a scan of it and a selfie. */
export interface IdentityVerifier {
  verify(check: IdentityCheck): Promise<IdentityResult>;
  /** The latest result of a pending session, for verifiers that use them. */
  resume?(sessionId: string, person: PersonDetails): Promise<IdentityResult>;
}
