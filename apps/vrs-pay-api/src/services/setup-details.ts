import type { OnboardingRecord } from "./onboarding.types";

/** What the dashboard shows of the details: secrets reduced to their last 4 digits. */
export function setupDetails(r: OnboardingRecord, verificationUrl: string | null) {
  return {
    business: {
      type: r.businessType,
      name: r.businessName,
      registration_number: r.registrationNumber,
      address: {
        line1: r.addressLine1,
        line2: r.addressLine2,
        city: r.city,
        postal_code: r.postalCode,
      },
      phone: r.phone,
    },
    product_description: r.productDescription,
    website: r.website,
    support_email: r.supportEmail,
    payout: r.payoutDetails
      ? {
          currency: r.payoutCurrency,
          account_name: r.payoutAccountName,
          bank_name: r.payoutBankName,
          last4: r.payoutLast4,
        }
      : null,
    identity: {
      country: r.country,
      id_type: r.idType,
      last4: r.idLast4,
      first_name: r.firstName,
      last_name: r.lastName,
      date_of_birth: r.dateOfBirth,
      status: r.identityStatus,
      reason: r.identityReason,
      /** Where to finish a document and selfie check; only while one is waiting. */
      verification_url: verificationUrl,
    },
  };
}
