export type VerificationStatus = "not_started" | "in_review" | "verified" | "rejected";
export type BusinessType = "individual" | "company";
export type IdentityStatus = "unverified" | "pending" | "verified" | "failed";

/** Everything a merchant tells us to go live and get paid. `status` is staff-only: "rejected" holds the account. */
export interface OnboardingRecord {
  merchantId: string;
  status: VerificationStatus;
  businessType: BusinessType | null;
  /** Legal name for companies; trading name (optional) for individuals. */
  businessName: string | null;
  /** Company registration number (CAC RC/BN, Companies House, EIN…); companies only. */
  registrationNumber: string | null;
  country: string | null;
  website: string | null;
  productDescription: string | null;
  firstName: string | null;
  lastName: string | null;
  dateOfBirth: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  postalCode: string | null;
  phone: string | null;
  supportEmail: string | null;
  idType: string | null;
  /** Sealed ID number. */
  idNumber: string | null;
  idLast4: string | null;
  identityStatus: IdentityStatus;
  identityReason: string | null;
  identityCheckedAt: number | null;
  /** The provider's session while the merchant finishes a document check (Stripe vs_…). */
  identitySessionId: string | null;
  payoutCurrency: string | null;
  payoutAccountName: string | null;
  payoutBankName: string | null;
  /** Sealed { accountNumber, bankCode }. */
  payoutDetails: string | null;
  payoutLast4: string | null;
  submittedAt: number | null;
  reviewedAt: number | null;
  rejectionReason: string | null;
}

export function emptyOnboarding(merchantId: string): OnboardingRecord {
  return {
    merchantId,
    status: "not_started",
    businessType: null,
    businessName: null,
    registrationNumber: null,
    country: null,
    website: null,
    productDescription: null,
    firstName: null,
    lastName: null,
    dateOfBirth: null,
    addressLine1: null,
    addressLine2: null,
    city: null,
    postalCode: null,
    phone: null,
    supportEmail: null,
    idType: null,
    idNumber: null,
    idLast4: null,
    identityStatus: "unverified",
    identityReason: null,
    identityCheckedAt: null,
    identitySessionId: null,
    payoutCurrency: null,
    payoutAccountName: null,
    payoutBankName: null,
    payoutDetails: null,
    payoutLast4: null,
    submittedAt: null,
    reviewedAt: null,
    rejectionReason: null,
  };
}
