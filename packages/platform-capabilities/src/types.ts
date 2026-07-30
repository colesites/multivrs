export type CapabilityProvider = "cloudflare" | "multivrs" | "multivrs+cloudflare" | "external";
export type CapabilityStatus = "available" | "preview" | "infrastructure-required";

export interface PlatformCapability {
  evidence: string;
  id: string;
  metered: boolean;
  name: string;
  provider: CapabilityProvider;
  status: CapabilityStatus;
}

export function capabilities<const T extends readonly PlatformCapability[]>(values: T): T {
  return values;
}
