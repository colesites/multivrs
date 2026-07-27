const DOMAIN_DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDomainDate(value: string): string {
  return DOMAIN_DATE_FORMATTER.format(new Date(value));
}
