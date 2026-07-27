import type { GitHubRepository } from "@/lib/schemas/github.schemas";

export function githubImportHref(
  repository: GitHubRepository,
  team: string,
): string {
  const query = new URLSearchParams({
    branch: repository.default_branch,
    name: repository.name,
    owner: repository.owner.login,
    provider: "github",
    s: repository.html_url,
    teamSlug: team,
  });
  return `/new/import?${query.toString()}`;
}
