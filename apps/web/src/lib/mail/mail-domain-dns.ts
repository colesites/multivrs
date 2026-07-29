export function absoluteMailDnsName(domain: string, name: string): string {
  const normalized = name.replace(/\.$/, "");
  if (normalized === "@" || normalized === domain) return domain;
  return normalized.endsWith(`.${domain}`)
    ? normalized
    : `${normalized}.${domain}`;
}

export function relativeMailDnsName(zone: string, name: string): string {
  if (name === zone) return "@";
  const suffix = `.${zone}`;
  if (!name.endsWith(suffix)) {
    throw new Error(`${name} is outside the managed DNS zone ${zone}`);
  }
  return name.slice(0, -suffix.length);
}

export function isMailDomainInZone(domain: string, zone: string): boolean {
  return domain === zone || domain.endsWith(`.${zone}`);
}

export function normalizeMailDnsValue(value: string): string {
  return value.replace(/^"(.*)"$/, "$1").replace(/\.$/, "");
}

export function isAuthenticatedSendingDomain(
  domain:
    | {
        provider: string | null;
        providerDomainId: string | null;
        status: string;
      }
    | null
    | undefined,
): boolean {
  return Boolean(
    domain?.status === "verified" &&
      domain.provider === "resend" &&
      domain.providerDomainId,
  );
}
