import { z } from "zod";

export const githubRepositorySchema = z.object({
  default_branch: z.string().min(1),
  description: z.string().nullable(),
  forks_count: z.number().int().nonnegative().default(0),
  full_name: z.string().min(1),
  html_url: z.url(),
  id: z.number().int(),
  is_turbo: z.boolean().optional(),
  language: z.string().nullable(),
  name: z.string().min(1),
  owner: z.object({ avatar_url: z.url(), login: z.string().min(1) }),
  private: z.boolean(),
  stargazers_count: z.number().int().nonnegative(),
  updated_at: z.string(),
});

export const githubRepositoriesResponseSchema = z.object({
  connected: z.boolean(),
  owner: z.string(),
  repos: z.array(githubRepositorySchema),
});

export const githubRepositoryUrlSchema = z.url().refine((value) => {
  const url = new URL(value);
  return (
    url.protocol === "https:" &&
    url.hostname === "github.com" &&
    url.pathname.split("/").filter(Boolean).length >= 2
  );
}, "Enter an HTTPS GitHub repository URL");

export type GitHubRepository = z.infer<typeof githubRepositorySchema>;
