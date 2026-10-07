/** A workspace slug from an account name: "Cole Sites!" → "cole-sites". */
export function teamSlugBase(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
  return slug || "team";
}

/** Candidate slugs, most natural first: cole, cole-team, cole-2, cole-3… */
export function teamSlugCandidates(base: string, count = 20): string[] {
  return [
    base,
    `${base}-team`,
    ...Array.from({ length: count }, (_, i) => `${base}-${i + 2}`),
  ];
}

/** Why an existing workspace can't become your team, or null when it can. */
export function adoptionBlocker(workspace: {
  accountOwnerId: string | null;
  projects: number;
  subscriptions: number;
  role: string | undefined;
}): string | null {
  if (workspace.accountOwnerId) return "This workspace is already a team.";
  if (workspace.role !== "owner")
    return "Only the workspace owner can do this.";
  if (workspace.projects > 0 || workspace.subscriptions > 0) {
    return "Move this workspace's projects and plan out first.";
  }
  return null;
}
