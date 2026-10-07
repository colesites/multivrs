import {
  absoluteMailDnsName,
  normalizeMailDnsValue,
} from "@/lib/mail/mail-domain-dns";

export interface ProviderDomainRecord {
  name: string;
  priority: number | null;
  purpose: string;
  status: string;
  ttl: string;
  type: string;
  value: string;
}

export type DomainVerificationStatus = "pending" | "verified" | "failed";

export interface ProviderDomainSnapshot {
  id: string;
  name: string;
  records: ProviderDomainRecord[];
  region: string;
  /** The domain can send once DKIM is verified. */
  status: DomainVerificationStatus;
  dkimStatus: DomainVerificationStatus;
  /** The bounces.<domain> MX check. Mail still sends while it is pending. */
  mailFromStatus: DomainVerificationStatus;
}

/** What SES reports for a domain identity, as read from GetEmailIdentity. */
export interface SesIdentityAttributes {
  DkimAttributes?: { Status?: string; Tokens?: string[] };
  MailFromAttributes?: { MailFromDomainStatus?: string };
}

/**
 * Subdomain prefix for Custom MAIL FROM in AWS SES.
 * Must match the MAIL FROM domain configured in the SES Console.
 */
export const MAIL_FROM_SUBDOMAIN = "bounces";

/** The optional MX record that brings the domain's mail into Multivrs. */
export const RECEIVING_PURPOSE = "inbound";

/**
 * SES DKIM and MAIL FROM statuses. TEMPORARY_FAILURE means SES couldn't
 * check this time and will try again, so it is still pending, not failed.
 */
export function mapSesStatus(status?: string): DomainVerificationStatus {
  switch (status) {
    case "SUCCESS":
      return "verified";
    case "FAILED":
      return "failed";
    default:
      return "pending";
  }
}

export function sesDomainSnapshot(
  domain: string,
  region: string,
  identity: SesIdentityAttributes,
): ProviderDomainSnapshot {
  const dkimStatus = mapSesStatus(identity.DkimAttributes?.Status);
  const mailFromStatus = mapSesStatus(
    identity.MailFromAttributes?.MailFromDomainStatus,
  );
  const mailFrom = absoluteMailDnsName(domain, MAIL_FROM_SUBDOMAIN);
  const records: ProviderDomainRecord[] = [
    {
      // Receiving: mail for the domain itself goes to SES, which hands it to
      // Multivrs. Optional, since the domain's mail may live elsewhere.
      name: domain,
      priority: 10,
      purpose: RECEIVING_PURPOSE,
      status: "pending",
      ttl: "Auto",
      type: "MX",
      value: `inbound-smtp.${region}.amazonaws.com`,
    },
    ...(identity.DkimAttributes?.Tokens ?? []).map((token, index) => ({
      name: `${token}._domainkey.${domain}`,
      priority: null,
      purpose: `dkim-${index + 1}`,
      status: dkimStatus,
      ttl: "Auto",
      type: "CNAME",
      value: `${token}.dkim.amazonses.com`,
    })),
    {
      name: mailFrom,
      priority: 10,
      purpose: "mx",
      status: mailFromStatus,
      ttl: "Auto",
      type: "MX",
      value: normalizeMailDnsValue(`feedback-smtp.${region}.amazonses.com`),
    },
    {
      name: mailFrom,
      priority: null,
      purpose: "spf",
      // SES only checks the MX record; SPF is checked in public DNS.
      status: "pending",
      ttl: "Auto",
      type: "TXT",
      value: "v=spf1 include:amazonses.com ~all",
    },
    {
      name: `_dmarc.${domain}`,
      priority: null,
      purpose: "dmarc",
      status: "pending",
      ttl: "Auto",
      type: "TXT",
      value: "v=DMARC1; p=none;",
    },
    {
      name: `default._bimi.${domain}`,
      priority: null,
      purpose: "bimi",
      status: "pending",
      ttl: "Auto",
      type: "TXT",
      value: `v=BIMI1; l=https://${domain}/logo.svg;`,
    },
  ];
  return {
    id: domain,
    name: domain,
    records,
    region,
    status: dkimStatus,
    dkimStatus,
    mailFromStatus,
  };
}

/** Records SES checks itself; SPF, DMARC and BIMI are only checked in public DNS. */
export function isProviderChecked(purpose: string): boolean {
  return purpose.startsWith("dkim") || purpose === "mx";
}

/**
 * A record's status on the domain page: `verified` once the provider
 * confirms it (or, for SPF, DMARC and BIMI, once it is in public DNS), `found`
 * when public DNS has it but the provider hasn't confirmed it yet, and
 * `missing` when public DNS doesn't have it.
 */
export function dnsRecordStatus(
  record: Pick<ProviderDomainRecord, "purpose" | "status">,
  inPublicDns: boolean,
): "verified" | "found" | "missing" {
  if (!isProviderChecked(record.purpose)) {
    return inPublicDns ? "verified" : "missing";
  }
  if (record.status === "verified") return "verified";
  return inPublicDns ? "found" : "missing";
}
