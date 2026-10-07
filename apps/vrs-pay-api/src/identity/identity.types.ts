export interface IdentityCheck {
  country: string;
  idType: string;
  idNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}

export type IdentityResult =
  | { status: "verified" }
  | { status: "failed"; reason: string }
  /** No automatic check available; our team confirms it. */
  | { status: "pending"; reason: string };

/** Checks an official ID against its issuer (e.g. BVN/NIN registries via a KYC provider). */
export interface IdentityVerifier {
  verify(check: IdentityCheck): Promise<IdentityResult>;
}
