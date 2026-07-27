export const PLATFORM_PROJECT_SECTIONS = [
  "analytics",
  "cdn",
  "emails",
  "environment-variables",
  "firewall",
  "integrations",
  "observability",
  "sandboxes",
  "speed-insights",
] as const;

export type PlatformSection = (typeof PLATFORM_PROJECT_SECTIONS)[number];

export function isPlatformProjectSection(
  value: string,
): value is PlatformSection {
  return PLATFORM_PROJECT_SECTIONS.some((section) => section === value);
}
